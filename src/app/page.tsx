import prisma from "@/lib/prisma";

export default async function Home() {
  const user = await prisma.user.findMany();


  return (
    <div>
      {JSON.stringify(user)}
    </div>
  );
}
