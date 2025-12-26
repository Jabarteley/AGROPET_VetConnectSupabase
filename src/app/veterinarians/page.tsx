import VetDirectory from '@/components/VetDirectory'

export default function VeterinariansPage() {
  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Find a Veterinarian
        </h1>
        <VetDirectory />
      </div>
    </div>
  )
}
