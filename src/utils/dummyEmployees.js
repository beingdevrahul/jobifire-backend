const DUMMY_EMPLOYEES = [
  { name: "Aarav Mehta", role: "Account Manager" },
  { name: "Riya Sharma", role: "Client Success Executive" },
  { name: "Kunal Verma", role: "Operations Specialist" },
  { name: "Neha Kapoor", role: "Support Lead" },
  { name: "Aditya Rao", role: "Relationship Manager" }
];

export const generateDummyEmployees = (count = 2) => {
  const shuffled = [...DUMMY_EMPLOYEES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((emp, index) => ({
    id: `virtual-${index + 1}`,
    name: emp.name,
    role: emp.role,
    isVirtual: true
  }));
};
