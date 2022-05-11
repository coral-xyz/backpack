import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function useAuth(privatePage: boolean) {
  const router = useRouter();
  const { data, status } = useSession({
    required: privatePage,
    onUnauthenticated() {
      router.push("/");
    },
  });

  return {
    session: data,
    status,
  };
}
