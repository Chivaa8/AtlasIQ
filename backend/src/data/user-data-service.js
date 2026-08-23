export function createUserDataService(store, normalize = object) {
  return {
    async list(userEmail) {
      return (await store.read()).filter((item) => !userEmail || item.userEmail === userEmail);
    },
    async create(userEmail, input) {
      if (!userEmail) throw new Error("userEmail is required");
      const item = { ...normalize(input), id: crypto.randomUUID(), userEmail, createdAt: new Date().toISOString() };
      await store.write([item, ...(await store.read())]);
      return item;
    },
    async update(userEmail, id, changes) {
      const items = await store.read();
      const index = items.findIndex((item) => item.id === id && item.userEmail === userEmail);
      if (index === -1) throw new Error("item not found");
      items[index] = { ...items[index], ...normalize({ ...items[index], ...changes }), id, userEmail, updatedAt: new Date().toISOString() };
      await store.write(items);
      return items[index];
    },
    async remove(userEmail, id) {
      const items = await store.read();
      if (!items.some((item) => item.id === id && item.userEmail === userEmail)) throw new Error("item not found");
      await store.write(items.filter((item) => item.id !== id || item.userEmail !== userEmail));
      return { removed: true };
    },
    async removeAny(id) {
      const items = await store.read();
      if (!items.some((item) => item.id === id)) throw new Error("item not found");
      await store.write(items.filter((item) => item.id !== id));
      return { removed: true };
    }
  };
}

function object(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("data is invalid");
  return input;
}
