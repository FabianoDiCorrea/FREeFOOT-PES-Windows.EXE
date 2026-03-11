import localforage from 'localforage';

// Configure stores
const freefootStore = localforage.createInstance({
  name: "FREeFOOT",
  storeName: "data"
});

const imageStore = localforage.createInstance({
  name: "FREeFOOT_Images",
  storeName: "uploads"
});

export const db = {
  async get(key) {
    return await freefootStore.getItem(key);
  },

  async getAll(key) {
    return await freefootStore.getItem(key) || [];
  },

  async save(key, data) {
    const serializableData = JSON.parse(JSON.stringify(data));
    return await freefootStore.setItem(key, serializableData);
  },

  async delete(key, id) {
    // Se for uma lista, remove o item pelo ID
    const list = await this.getAll(key);
    const updated = list.filter(item => item.id !== id);
    return await this.save(key, updated);
  },

  // Image handling (stores as base64)
  async saveImage(id, base64) {
    return await imageStore.setItem(id, base64);
  },

  async getImage(id) {
    return await imageStore.getItem(id);
  },

  // Backup methods
  async exportData() {
    const data = {
      store: {},
      images: {}
    };

    // Export main data
    const dataKeys = await freefootStore.keys();
    for (const key of dataKeys) {
      data.store[key] = await freefootStore.getItem(key);
    }

    // Export images
    const imageKeys = await imageStore.keys();
    for (const key of imageKeys) {
      data.images[key] = await imageStore.getItem(key);
    }

    return JSON.stringify(data, null, 2);
  },

  async exportDatabase() {
    const data = {
      store: {},
      images: {}
    };

    // Export main data
    const dataKeys = await freefootStore.keys();
    for (const key of dataKeys) {
      data.store[key] = await freefootStore.getItem(key);
    }

    // Export images
    const imageKeys = await imageStore.keys();
    for (const key of imageKeys) {
      data.images[key] = await imageStore.getItem(key);
    }

    return data;
  },

  async importData(jsonContent) {
    try {
      const data = JSON.parse(jsonContent);

      // Old format support (only store data)
      if (!data.store && !data.images) {
        for (const [key, value] of Object.entries(data)) {
          await freefootStore.setItem(key, value);
        }
        return true;
      }

      // New format support
      if (data.store) {
        for (const [key, value] of Object.entries(data.store)) {
          await freefootStore.setItem(key, value);
        }
      }

      if (data.images) {
        for (const [key, value] of Object.entries(data.images)) {
          await imageStore.setItem(key, value);
        }
      }

      return true;
    } catch (e) {
      console.error("Erro na importação:", e);
      return false;
    }
  },

  async importDatabaseFromJSON(data) {
    try {
      if (!data) return false;

      // Old format support
      if (!data.store && !data.images) {
        for (const [key, value] of Object.entries(data)) {
          await freefootStore.setItem(key, value);
        }
        return true;
      }

      // New format
      if (data.store) {
        for (const [key, value] of Object.entries(data.store)) {
          await freefootStore.setItem(key, value);
        }
      }

      if (data.images) {
        for (const [key, value] of Object.entries(data.images)) {
          await imageStore.setItem(key, value);
        }
      }

      return true;
    } catch (e) {
      console.error("Erro na importação de objeto:", e);
      return false;
    }
  },

  async clearDatabase() {
    try {
      await freefootStore.clear();
      await imageStore.clear();
      return true;
    } catch (e) {
      console.error("Erro ao limpar banco de dados:", e);
      return false;
    }
  }
};
