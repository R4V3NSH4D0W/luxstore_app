export const getStatusColor = (status: string, colors: any) => {
  switch (status.toLowerCase()) {
    case "delivered":
    case "completed":
      return "#22C55E"; // Green
    case "shipped":
      return "#3B82F6"; // Blue
    case "processing":
      return "#3B82F6"; // Blue
    case "cancelled":
      return "#EF4444"; // Red
    case "pending":
      return "#EAB308"; // Yellow
    case "refunded":
      return "#A855F7"; // Purple
    default:
      return colors.muted;
  }
};
