import Link from "next/link"

export default function Header() {
    return (
        <header className="flex justify-between items-center font-inter p-4 bg-[#F0F5FC] text-[#21252B]">
            <h1 className="font-[500] text-2xl">Dokugen</h1>

            <nav>
                <div className="flex space-x-6">
                    <Link href="/">Home</Link>
                    <Link href="/docs">Documentation</Link>
                    <Link href="/leaderboard">Leaderboard</Link>
                </div>
            </nav>
        </header>
    )
}