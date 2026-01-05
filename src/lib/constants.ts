export const LOCATIONS = {
  india: {
    name: "India",
    states: {
      maharashtra: {
        name: "Maharashtra",
        cities: ["Mumbai", "Pune", "Nashik", "Nagpur", "Thane"]
      },
      karnataka: {
        name: "Karnataka",
        cities: ["Bangalore", "Mysore", "Hubli", "Mangalore"]
      },
      delhi: {
        name: "Delhi",
        cities: ["New Delhi", "North Delhi", "South Delhi"]
      },
      gujarat: {
        name: "Gujarat",
        cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"]
      },
      tamil_nadu: {
        name: "Tamil Nadu",
        cities: ["Chennai", "Coimbatore", "Madurai", "Trichy"]
      }
    }
  },
  usa: {
    name: "USA",
    states: {
      california: {
        name: "California",
        cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose"]
      },
      new_york: {
        name: "New York",
        cities: ["New York City", "Buffalo", "Rochester", "Albany"]
      },
      texas: {
        name: "Texas",
        cities: ["Houston", "Austin", "Dallas", "San Antonio"]
      }
    }
  },
  uk: {
    name: "UK",
    states: {
      england: {
        name: "England",
        cities: ["London", "Manchester", "Birmingham", "Liverpool"]
      },
      scotland: {
        name: "Scotland",
        cities: ["Edinburgh", "Glasgow", "Aberdeen"]
      }
    }
  },
  germany: {
    name: "Germany",
    states: {
      berlin: {
        name: "Berlin",
        cities: ["Berlin"]
      },
      bavaria: {
        name: "Bavaria",
        cities: ["Munich", "Nuremberg", "Augsburg"]
      }
    }
  }
} as const;

export type CountryCode = keyof typeof LOCATIONS;
