export function createTrip(destination, userEmail) {
  return {
    id: crypto.randomUUID(),
    userEmail,
    name: destination.name,
    city: destination.city,
    continent: destination.continent,
    estimatedCost: destination.estimatedCost,
    createdAt: new Date().toISOString()
  };
}
