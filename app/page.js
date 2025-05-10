"use client";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-200 to-primary">
      <div className="max-w-lg bg-white shadow-lg rounded-lg p-20 text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Welcome to MGood Dashboard
        </h1>
        <p className="text-gray-700 mb-6">
          For Doctors. Please{" "}
          <span className="text-primary font-semibold">log in</span> to get
          started.
        </p>
        
          <button className="bg-primary hover:bg-green-500 text-white font-medium py-2 px-6 rounded-lg transition duration-300"
          onClick={()=>{router.push('/dashboard')}}>
            Log In
          </button>
        
      </div>
    </div>
  );
}
