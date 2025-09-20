import Spinner from "../_components/Spinner";
function Loading() {
  return (
    <div className=" flex justify-center items-center flex-col gap-5">
      <Spinner />
      <p className="text-2xl font-semibold">cabins is Loading...</p>
    </div>
  );
}

export default Loading;
