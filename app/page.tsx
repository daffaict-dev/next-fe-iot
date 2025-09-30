import { redirect } from "next/navigation";


export default function Home() {
  return (
  redirect("/login") // otomatis redirect ke /login
  );
}
