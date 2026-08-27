import Spinner from "@/components/Spinner";
function Loading() {
  return (
    <div className=" flex justify-center items-center flex-col gap-5">
      <Spinner />
      <p className="text-2xl font-semibold">cabin is Loading...</p>
    </div>
  );
}

export default Loading;
