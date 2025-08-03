import { ProjectForm } from "@/components/modules/home/ProjectForm";
import { ProjectList } from "@/components/modules/home/ProjectList";
import CaffeineLogo from "@/components/modules/logo/CaffeineLogo";



export default function Home() {



  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center">


          <CaffeineLogo size="lg" variant="icon" className="hidden md:block" />
        </div>

        <h1 className="text-xl md:text-4xl font-bold text-center">
          Transform Your Vision into Reality with Caffiene
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground text-center">
          Create apps, websites, and AI-powered experiences with ease.
        </p>

        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>

      <ProjectList />
    </div>
  );
}
