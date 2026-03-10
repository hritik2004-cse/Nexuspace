"use client";

import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import { FiPlus } from 'react-icons/fi';

export default function KanbanColumn({ column, tasks }) {
  return (
    <div className="flex flex-col w-80 flex-shrink-0 bg-slate-900/50 rounded-xl border border-slate-800 h-full max-h-full">
      {/* Column Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center group">
        <h3 className="font-bold text-sm text-slate-200 tracking-wide flex items-center gap-2">
          {column.title}
          <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </h3>
        <button className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-800 opacity-0 group-hover:opacity-100">
          <FiPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-3 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent ${
              snapshot.isDraggingOver ? 'bg-slate-800/20' : ''
            } transition-colors`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
