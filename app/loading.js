import Spinner from "@/app/_components/Spinner"

function loading() {
    return (
        <div className="flex justify-center items-center flex-col gap-5">
            <Spinner/>
        </div>
    )
}

export default loading
