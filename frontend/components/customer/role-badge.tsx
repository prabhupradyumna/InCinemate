interface RoleBadgeProps {
  role: "customer" | "admin" | "super-admin"
  className?: string
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const roleConfig = {
    customer: {
      label: "Customer",
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    admin: {
      label: "Admin",
      className: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    "super-admin": {
      label: "Super Admin",
      className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  }

  const config = roleConfig[role]

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  )
}
