import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      <h1 className="font-bold text-lg">🚆 Wagon Admin</h1>

      <div className="space-x-4">
        <Link to="/">Dashboard</Link>
        <Link to="/wagons">Wagons</Link>
        <Link to="/add">Add Wagon</Link>
      </div>
    </nav>
  );
}