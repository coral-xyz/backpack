export const users = {
  alice: {
    id: "c7709c76-aa1a-4dfe-8242-786f7d6e8b19",
    jwt: "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjNzcwOWM3Ni1hYTFhLTRkZmUtODI0Mi03ODZmN2Q2ZThiMTkiLCJpc3MiOiJhdXRoLnhuZnRzLmRldiIsImF1ZCI6ImJhY2twYWNrIiwiaWF0IjoxNjgwNzAxMjk5fQ.HnMEi_acM9uauL-17isLEU97WKctpdv10rvdTvHzd5dfbAbkyqqpJpepwLHRI86nejMxeHYyrNTSN4xk3pyeR1Xc--mj4Z7jHnwBXaV_ZROhAxz3y0koeUS7UaJ5oP7pqzzqC4dux6yUkqYIlpVqUZHrTauswILWGwdjxgAdrxDme81EkR5_QhDqSCfE0GvORto8xOoDHFxLQWWI3LAaXwFpHdfQcowLM_4lJGv-KKU3pPYT41OTCQFFP4JZbb2mkSslSnMu0kUN1NAXIQWf67X1ijogFndss3N4Cm0EUNwGkln1nXh7Gzx98HConrGJSjmeXtqwPSx5P7IBFzDL3w",
    public_keys: {
      solana: {
        primary: 0,
        keys: [
          "J6QiUPJPo3obf8aQFLai8jTU6EGBkV2hyBMoQ4K7k7hS",
          "2HPCw1XC8oJMR2gNZDGJAapZWWkgc9TQ4wsYErEW7sqd",
        ],
      },
      ethereum: {
        primary: 0,
        keys: ["0xbBe322d172f49232b024Ec756D3F0DDf6D92A12a"],
      },
    },
  },
  bob: {
    id: "bb3d0b94-15f1-4610-a198-ec1bf1bd5aac",
    jwt: "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiYjNkMGI5NC0xNWYxLTQ2MTAtYTE5OC1lYzFiZjFiZDVhYWMiLCJpc3MiOiJhdXRoLnhuZnRzLmRldiIsImF1ZCI6ImJhY2twYWNrIiwiaWF0IjoxNjgwNzAxNjM4fQ.P2FydtVjmrCFoS31If4nwzj-NHZ1j8CJ4GYcv7A7QiVEZQh4jH3fSk3uZM_OU67GF2u6OG_u_-M6l67aOfdtrkwowCCpk0iEbmB-eSz1oTHg_jgn6qgAzuSw3sStAtqNlOKwdquk2k0NmOvIphHH0_JW-n58WNTUWE2gV41Hs-MN61goE4230DcDYTaVCwkDYs4qjpoOK3AuJ76sYKuxJp78rTc12xtYScSi3s6Lzi1btCOVSID41n7UX9btv1nQxm6UH6HWa5lH5Pb5C8Mqf7RuNg_rrUXC36clzvqLj63A8gLwnGYPNlY1bpDwowy9toUixsBs_X92I4bxl_lOrg",
    public_keys: {
      solana: {
        primary: 1,
        keys: [
          "4rRGXiiHqZ4ePypCG3RZE1EBTru2L6HxKfh3SRa8Gjpu",
          "D5TpbcEsFVTeF6cHt3nT4j8vUAYCQX4YWeMiZr37UQik",
          "5bDxPkA2WGgJNRHh7bfprH6epaJWir4prTy3kCEgPUix",
        ],
      },
      ethereum: {
        primary: 0,
        keys: ["0x01B9E593bc84eD499C02241b88b82F274c372Eb1"],
      },
    },
  },
  ali: {
    id: "fb14ab0c-f20f-4b5d-a8d9-f9409eb69380",
    jwt: "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJmYjE0YWIwYy1mMjBmLTRiNWQtYThkOS1mOTQwOWViNjkzODAiLCJpc3MiOiJhdXRoLnhuZnRzLmRldiIsImF1ZCI6ImJhY2twYWNrIiwiaWF0IjoxNjgwNzAyMTAxfQ.ClllrJvRXQZzFKwmJJi_2Ek1JSad2VMugodEq9GEg0D40HNNak7iMLEOfYlaE7uZ6yq5nKIaHm6QUJ7mRbPrWBQq0Zr5GFnzt-16aL3reYAtt_o5ho-fijZ-TAZGL6dGCfJ05zzLMJGH7rjaEXAQkoOceWP6P8_FCdJds2XFraMTNUQzNvrNbsB6f3v2mAnIr1mWYykztWTW-EDzz3Bkpg0sOrccFOjI-rpO1GZ9OclOEuzYRb08WVQVbVsQc6VK0Z8FjE9xWNNPKj4swuNsXEnd3CZdVB4fniyHKVpXQg7QSb5LzBz60ywi9A64c1D7kfZX95zMQlRMoq1qYbD2eA",
    public_keys: {
      // ali is an eth-only user
      ethereum: {
        primary: 0,
        keys: ["0x6Ecc980c2acB5aaCA12e3DBC2bdE2bC7dDc4d2D9"],
      },
    },
    primary_keys: {
      ethereum: ["0x6Ecc980c2acB5aaCA12e3DBC2bdE2bC7dDc4d2D9"],
    },
  },
  sol_only: {
    id: "3682450b-c79b-4b62-a3d9-5afdbd6d34d7",
    jwt: "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzNjgyNDUwYi1jNzliLTRiNjItYTNkOS01YWZkYmQ2ZDM0ZDciLCJpc3MiOiJhdXRoLnhuZnRzLmRldiIsImF1ZCI6ImJhY2twYWNrIiwiaWF0IjoxNjgwNzAyMjY4fQ.Ufx857qRiHE-NdM_olG97818Ouru72fLCEuSoC4huojEOvDfWQwP3MWGomyh6D70J7lASw-XIGR-vlv6wTdO6EdfZFJ7UMCosKoUrWnRZb-JekDBqxwIvKRfl2kEiwrWAZ8XT-3VnEigX6sGn340rVMmzPl87EZ7u6zeb0Sej7yggtGdzK5We7iqRip2ZYkeD2obIGGBdHcmy-XHOeJTVJBvG-F9jPUM6HsVpohCFMsPscJjPuLi0UuqhKBPmZUfSPWRY_VLky8_cvgjU7K7ldl_3xkp0gRgtK7UJfDIJLNbAgOkUFiOOkjn-VFU5zXQYXhXp5RFd8nx9ftQtxBUbQ",
    public_keys: {
      solana: {
        primary: 0,
        keys: ["7LugqdvheW9gmNNvt9dJRf4RDGWn9PyM2ssEtoZuUpDk"],
      },
    },
  },
  unregistered_user: {
    id: "",
    jwt: "",
    public_keys: {},
  },
} as const;

const asUser =
  (username?: keyof typeof users) =>
  (method: "get" | "post") =>
  async (path: string, data?: any) => {
    const res = await fetch(`${API_URL}/${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: username ? `jwt=${users[username].jwt}` : "",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return await res.json();
  };

export const { alice, bob, sol_only, eth_only, unregistered_user } =
  Object.entries(users).reduce((acc, [username, user]) => {
    const u = username as keyof typeof users;
    acc[u] = {
      ...user,
      get: asUser(u)("get"),
      post: asUser(u)("post"),
    };
    return acc;
  }, {} as { [key in keyof typeof users]: (typeof users)[key] & { get: (path: string) => Promise<any>; post: (path: string, data?: any) => Promise<any> } });

export const API_URL = "http://localhost:8080" as const;
