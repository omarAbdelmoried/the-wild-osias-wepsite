export default function Empty({ resource }: { resource: string }) {
  return <p className="text-primary-300">No {resource} could be found.</p>;
}
