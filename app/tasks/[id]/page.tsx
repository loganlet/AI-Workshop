import TaskDetail from "./task-detail";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container">
      <main>
        <TaskDetail id={id} />
      </main>
    </div>
  );
}
