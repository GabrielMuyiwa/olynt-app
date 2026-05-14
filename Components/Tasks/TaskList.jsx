import TaskCard from "./TaskCard";

export default function TaskList({ tasks, startTask, completed }) {
  return (
    <div>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onStart={startTask}
          completed={completed[task.id]}
        />
      ))}
    </div>
  );
}