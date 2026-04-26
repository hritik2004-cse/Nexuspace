"use client";

import { FiMoreHorizontal, FiCalendar, FiClock } from 'react-icons/fi';
import { Draggable } from '@hello-pangea/dnd';

export default function TaskCard({ task, index }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-slate-800 p-4 mb-3 rounded-xl border ${
            snapshot.isDragging ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105' : 'border-slate-700 hover:border-slate-600 shadow-sm'
          } transition-all cursor-grab active:cursor-grabbing font-sans relative group`}
          style={{ ...provided.draggableProps.style }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, i) => (
                <span key={i} className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-${tag.color}-500/10 text-${tag.color}-400 border border-${tag.color}-500/20`}>
                  {tag.name}
                </span>
              ))}
            </div>
            <button className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <FiMoreHorizontal />
            </button>
          </div>
          
          <h4 className="text-sm font-semibold text-slate-100 mb-2 leading-snug">
            {task.title}
          </h4>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-xs text-slate-400 gap-3 font-medium">
              {task.date && (
                <span className="flex items-center gap-1">
                  <FiCalendar className="w-3 h-3" />
                  {task.date}
                </span>
              )}
            </div>
            {task.assignee && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-[10px] shadow outline outline-2 outline-slate-800" title={task.assignee}>
                {task.assignee.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
