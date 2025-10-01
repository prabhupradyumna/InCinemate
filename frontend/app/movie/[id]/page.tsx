"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"

// Mock data for a single movie
const movieDetails = {
  id: "movie_001",
  title: "The Dark Knight",
  poster_url: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  banner_url: "https://image.tmdb.org/t/p/original/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
  format: "2D",
  language: "English",
  duration: "2h 32m",
  genres: ["Action", "Crime", "Drama"],
  certificate: "U/A",
  release_date: "July 18, 2008",
  rating: 8.9,
  imdb_rating: 9.0,
  about:
    "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
  trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
}

// Mock data for cast and crew
const cast = [
  { id: 1, name: "Christian Bale", role: "Bruce Wayne", image_url: "https://placehold.co/150" },
  { id: 2, name: "Heath Ledger", role: "Joker", image_url: "https://placehold.co/150" },
  { id: 3, name: "Aaron Eckhart", role: "Harvey Dent", image_url: "https://placehold.co/150" },
  { id: 4, name: "Michael Caine", role: "Alfred", image_url: "https://placehold.co/150" },
  { id: 5, name: "Maggie Gyllenhaal", role: "Rachel", image_url: "https://placehold.co/150" },
]

const crew = [
  { id: 1, name: "Christopher Nolan", role: "Director", image_url: "https://placehold.co/150" },
  { id: 2, name: "Jonathan Nolan", role: "Screenplay", image_url: "https://placehold.co/150" },
  { id: 3, name: "Hans Zimmer", role: "Music", image_url: "https://placehold.co/150" },
]

// Mock data for awards
const awards = [
  { 
    id: 1, 
    award_name: "Academy Awards", 
    recipient: "Heath Ledger", 
    category: "Winner, Best Supporting Actor", 
    image_url: "https://placehold.co/100x100?text=Oscar" 
  },
  { 
    id: 2, 
    award_name: "Golden Globe Awards", 
    recipient: "Heath Ledger", 
    category: "Winner, Best Supporting Actor", 
    image_url: "https://placehold.co/100x100?text=Globe" 
  },
  { 
    id: 3, 
    award_name: "BAFTA Awards", 
    recipient: "Heath Ledger", 
    category: "Winner, Best Supporting Actor", 
    image_url: "https://placehold.co/100x100?text=BAFTA" 
  },
]

// Mock data for reviews
const reviews = [
  { id: 1, author: "Cinephile_Max", rating: 5, text: "An absolute masterpiece. Heath Ledger's Joker is legendary.", likes: 112, dislikes: 3 },
  { id: 2, author: "MovieFan_88", rating: 4, text: "Still holds up as one of the best comic book movies ever made.", likes: 98, dislikes: 1 },
  { id: 3, author: "Sarah_G", rating: 5, text: "The tension and storytelling are top-notch. A must-watch.", likes: 154, dislikes: 5 },
]

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  // Use route param for booking link; the visual is based on mock movieDetails
  const bookingId = params.id || movieDetails.id
  const [showAllReviews, setShowAllReviews] = useState(false)
  
  // Review form state
  const [newReviewRating, setNewReviewRating] = useState(0)
  const [newReviewText, setNewReviewText] = useState("")
  const [hoveredStar, setHoveredStar] = useState(0)
  
  // Voting state - track which reviews have been voted on
  const [votedReviews, setVotedReviews] = useState<Set<number>>(new Set())
  const [reviewVotes, setReviewVotes] = useState<{[key: number]: {likes: number, dislikes: number}}>({})

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 2)
  
  // Initialize review votes
  const getReviewVotes = (reviewId: number) => {
    const review = reviews.find(r => r.id === reviewId)
    return reviewVotes[reviewId] || { likes: review?.likes || 0, dislikes: review?.dislikes || 0 }
  }
  
  // Handle voting
  const handleVote = (reviewId: number, voteType: 'like' | 'dislike') => {
    if (votedReviews.has(reviewId)) return
    
    setVotedReviews(prev => new Set([...prev, reviewId]))
    setReviewVotes(prev => {
      const current = getReviewVotes(reviewId)
      return {
        ...prev,
        [reviewId]: {
          likes: voteType === 'like' ? current.likes + 1 : current.likes,
          dislikes: voteType === 'dislike' ? current.dislikes + 1 : current.dislikes
        }
      }
    })
  }
  
  // Handle review submission
  const handleSubmitReview = () => {
    if (newReviewRating > 0 && newReviewText.trim()) {
      // In a real app, this would send to backend
      console.log('New review:', { rating: newReviewRating, text: newReviewText })
      setNewReviewRating(0)
      setNewReviewText("")
    }
  }
  
  // Render stars for display (used in review cards)
  const renderStars = (rating: number, size: string = "h-4 w-4") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <style jsx>{`
        @keyframes slow-zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite;
        }
      `}</style>

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* Hero Section - BookMyShow Style */}
        <section className="relative w-full h-[60vh] md:h-[70vh]">
          {/* Full-Width Background Banner */}
          <Image
            src={movieDetails.banner_url}
            alt={movieDetails.title}
            fill
            className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
            priority
          />

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

          {/* Centered Content Wrapper */}
          <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center gap-10">
            {/* Left div (Poster) */}
            <div className="relative flex-shrink-0 w-full max-w-[240px] sm:max-w-[280px] md:max-w-[250px] aspect-[2/3]">
              <Image
                src={movieDetails.poster_url}
                alt={movieDetails.title}
                fill
                className="rounded-lg shadow-2xl object-cover"
              />
            </div>

            {/* Right div (Text Details) */}
            <div className="flex-grow space-y-6">
              {/* Movie Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                {movieDetails.title}
              </h1>

              {/* Ratings */}
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold">{movieDetails.rating}/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded bg-[#F5C518] text-black px-1.5 py-0.5 text-xs font-bold">IMDb</span>
                  <span className="font-semibold">{movieDetails.imdb_rating}/10</span>
                </div>
              </div>

              {/* Metadata Bar */}
              <div className="text-sm text-gray-300">
                <span className="font-medium text-white">
                  {movieDetails.format}
                </span>
                <span className="px-2">•</span>
                <span>{movieDetails.language}</span>
                <span className="px-2">•</span>
                <span>{movieDetails.duration}</span>
                <span className="px-2">•</span>
                <span>{movieDetails.genres.join(", ")}</span>
                <span className="px-2">•</span>
                <span>{movieDetails.certificate}</span>
                <span className="px-2">•</span>
                <span>{movieDetails.release_date}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <Link href={`/booking/${bookingId}`}>
                  <button className="w-40 h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105">
                    Book Tickets
                  </button>
                </Link>
                <a
                  href={movieDetails.trailer}
                  target="_blank"
                  rel="noreferrer"
                  className="w-40 h-12 flex items-center justify-center border-2 border-white/70 bg-transparent text-white hover:bg-white/10 hover:border-white rounded-lg transition-all duration-300"
                >
                  Watch Trailer
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About the Movie Section */}
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">About the movie</h3>
          <p className="text-base text-gray-300 leading-relaxed max-w-4xl">
            {movieDetails.about}
          </p>
        </section>

        {/* Section Divider */}
        <hr className="border-gray-700 opacity-50" />

        {/* Cast & Crew Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-semibold text-white mb-6">Cast & Crew</h2>

          {/* Cast */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-gray-300">Cast</h3>
            <div className="-mx-4 px-4 overflow-x-auto">
              <div className="flex gap-4">
                {cast.map((person) => (
                  <div key={person.id} className="w-32 shrink-0 text-center bg-gray-800 border border-gray-700 rounded-lg p-3">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-600 mb-3">
                      <Image src={person.image_url} alt={person.name} width={80} height={80} className="object-cover w-full h-full" />
                    </div>
                    <div className="text-sm font-medium text-white truncate">{person.name}</div>
                    <div className="text-xs text-gray-400 truncate">{person.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Crew */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-gray-300">Crew</h3>
            <div className="-mx-4 px-4 overflow-x-auto">
              <div className="flex gap-4">
                {crew.map((person) => (
                  <div key={person.id} className="w-32 shrink-0 text-center bg-gray-800 border border-gray-700 rounded-lg p-3">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-600 mb-3">
                      <Image src={person.image_url} alt={person.name} width={80} height={80} className="object-cover w-full h-full" />
                    </div>
                    <div className="text-sm font-medium text-white truncate">{person.name}</div>
                    <div className="text-xs text-gray-400 truncate">{person.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <hr className="border-gray-700 opacity-50" />

        {/* Awards & Achievements Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-white">Awards & Achievements</h2>
          <div className="flex flex-col gap-4">
            {awards.map((award, index) => (
              <div key={award.id} className={`flex items-center gap-4 ${index !== awards.length - 1 ? 'border-b border-gray-700 pb-4' : ''}`}>
                {/* Icon/Image */}
                <div className="flex-shrink-0">
                  <Image 
                    src={award.image_url} 
                    alt={award.award_name}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                </div>
                {/* Award Details */}
                <div className="flex-grow">
                  <h3 className="text-white text-base">
                    <span className="font-bold">{award.recipient}</span>
                    <span className="text-gray-300 font-normal"> - {award.category}</span>
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{award.award_name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section Divider */}
        <hr className="border-gray-700 opacity-50" />

        {/* Ratings & Reviews Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-semibold text-white">Reviews</h2>
            <Button
              variant="outline"
              className="bg-transparent border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
              onClick={() => setShowAllReviews((v) => !v)}
            >
              {showAllReviews ? `Show less` : `View all (${reviews.length}) reviews`}
            </Button>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Write a Review Form - Left Column */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4 sticky top-4">
                <h3 className="text-lg font-semibold text-white">Write a Review</h3>
                
                {/* 5-Star Rating Input */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Rating</label>
                  <div className="flex gap-1 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-7 w-7 cursor-pointer transition-colors ${
                          star <= (hoveredStar || newReviewRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600 hover:text-yellow-300'
                        }`}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setNewReviewRating(star)}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-400">
                      {newReviewRating > 0 ? `${newReviewRating}/5` : 'Select rating'}
                    </span>
                  </div>
                </div>

                {/* Text Area */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Your Review</label>
                  <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full h-32 bg-transparent border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitReview}
                  disabled={!newReviewRating || !newReviewText.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Submit Review
                </Button>
              </div>
            </div>

            {/* Reviews List - Right Two Columns */}
            <div className="lg:col-span-2 space-y-4">
              {visibleReviews.map((r) => {
                const votes = getReviewVotes(r.id)
                const hasVoted = votedReviews.has(r.id)
                
                return (
                  <div key={r.id} className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-5">
                    <div className="flex gap-4">
                      {/* Left Side - Author Info */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {r.author.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Right Side - Review Content */}
                      <div className="flex-grow space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-white text-base">{r.author}</h4>
                          </div>
                          {/* 5-Star Rating Display */}
                          <div className="flex items-center gap-2">
                            {renderStars(r.rating, "h-4 w-4")}
                            <span className="text-sm text-gray-400">({r.rating}/5)</span>
                          </div>
                        </div>
                        
                        {/* Review Text */}
                        <p className="text-gray-300 text-sm leading-relaxed">{r.text}</p>
                        
                        {/* Voting Buttons */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => handleVote(r.id, 'like')}
                            disabled={hasVoted}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                              hasVoted 
                                ? 'text-gray-500 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-green-400 hover:bg-green-400/10'
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>{votes.likes}</span>
                          </button>
                          
                          <button
                            onClick={() => handleVote(r.id, 'dislike')}
                            disabled={hasVoted}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                              hasVoted 
                                ? 'text-gray-500 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
                            }`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                            <span>{votes.dislikes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Sticky CTA for mobile */}
        <div className="fixed bottom-0 inset-x-0 p-3 md:hidden bg-gray-900/90 backdrop-blur border-t border-gray-700">
          <div className="container mx-auto px-0">
            <Link href={`/booking/${bookingId}`}>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Book Tickets</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
