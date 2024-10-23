export default function Home() {
  return (
    <div className="h-[90vh] w-screen bg-gradient-to-bl from-background via-background to-green-950">
      <div className="h-full w-full flex justify-center items-center">
        <div className="w-9/12">
          <div className="p-10 w-full flex justify-normal space-x-2">
            <div className="text-lg w-full md:text-xl lg:text-2xl font-medium">
              <span className="text-4xl font-bold pr-2">
                Manage your expenses with
              </span>
              <span className="text-4xl font-bold text-shadow-xxl shadow-primary text-primary">
                Smart Spend
              </span>
              <p className="text-xl font-bold pr-2">
                Smart spend allows user to manage their expenses with ease.
                Check our features below
              </p>
            </div>
          </div>
        </div>
        <div className="w-[35vh] h-[70vh] border border-lime-100" />
      </div>
    </div>
  );
}
