import { BuyForm } from "../web3/BuyForm"

export default function BuySection() {
    return (
        <div className="w-full h-dvh flex justify-center">
            <div className="w-full max-w-[500px] px-5">
                <BuyForm />
            </div>
        </div>
    )
}