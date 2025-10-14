// Pricing resolution service
// Precedence: seat_pricing (show-specific) > seat_pricing (base) > show.pricing (category/row) > default

export default class PricingService {
  static async resolvePricesForSeats({ sequelize, models, seatIds, show, defaultPrice = 250, now = new Date() }) {
    const { SeatPricing, Seat } = models

    // Query show-specific pricing for these seats
    const showSpecific = await SeatPricing.findAll({
      where: {
        seat_id: { [sequelize.Sequelize.Op.in]: seatIds },
        show_id: show?.id || null,
        [sequelize.Sequelize.Op.or]: [
          { effective_from: null },
          { effective_from: { [sequelize.Sequelize.Op.lte]: now } }
        ],
        [sequelize.Sequelize.Op.or]: [
          { effective_to: null },
          { effective_to: { [sequelize.Sequelize.Op.gte]: now } }
        ]
      }
    })

    const showSpecificMap = new Map(showSpecific.map(sp => [sp.seat_id, Number(sp.price)]))

    // Query base pricing for seats that don't have show-specific
    const remainingSeatIds = seatIds.filter(id => !showSpecificMap.has(id))
    let baseMap = new Map()
    if (remainingSeatIds.length > 0) {
      const basePricing = await SeatPricing.findAll({
        where: {
          seat_id: { [sequelize.Sequelize.Op.in]: remainingSeatIds },
          show_id: null,
          [sequelize.Sequelize.Op.or]: [
            { effective_from: null },
            { effective_from: { [sequelize.Sequelize.Op.lte]: now } }
          ],
          [sequelize.Sequelize.Op.or]: [
            { effective_to: null },
            { effective_to: { [sequelize.Sequelize.Op.gte]: now } }
          ]
        }
      })
      baseMap = new Map(basePricing.map(sp => [sp.seat_id, Number(sp.price)]))
    }

    // Return price per seat id
    const results = new Map()
    for (const seatId of seatIds) {
      // Priority 1: show-specific
      if (showSpecificMap.has(seatId)) {
        results.set(seatId, showSpecificMap.get(seatId))
        continue
      }
      // Priority 2: base
      if (baseMap.has(seatId)) {
        results.set(seatId, baseMap.get(seatId))
        continue
      }
      // Priority 3: show.pricing matrix fallback requires seat details
      // Caller should compute this using loaded seats if needed
      results.set(seatId, null)
    }

    return results
  }

  static resolveFromShowMatrix({ seat, show, defaultPrice = 250 }) {
    if (show?.pricing) {
      if (show.pricing[seat.category]) return Number(show.pricing[seat.category])
      const rowKey = `row_${seat.row}`
      if (show.pricing[rowKey]) return Number(show.pricing[rowKey])
    }
    return defaultPrice
  }
}


