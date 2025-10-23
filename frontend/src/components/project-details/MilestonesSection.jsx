import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, ChevronDown, ChevronUp, Edit2, Trash2, Circle, CheckCircle2, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDateDisplay } from '../../utils/dateUtils';

function MilestonesSection({
  milestones,
  expandedMilestones,
  setExpandedMilestones,
  teamMembers,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onAddDeliverable,
  onToggleDeliverable,
  onEditDeliverable,
  onDeleteDeliverable,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleTask
}) {
  const toggleMilestone = (milestoneId) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }));
  };

  const getTeamMemberName = (teamMemberId) => {
    const member = teamMembers.find(m => m._id === teamMemberId);
    return member ? member.name : 'Unassigned';
  };

  const getDeliverableStats = (deliverables) => {
    const total = deliverables?.length || 0;
    const completed = deliverables?.filter(d => d.isCompleted).length || 0;
    return { total, completed };
  };

  const getTaskStats = (tasks) => {
    const total = tasks?.length || 0;
    const completed = tasks?.filter(t => t.isCompleted).length || 0;
    return { total, completed };
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            Milestones ({milestones.length})
          </div>
          <Button
            onClick={onAddMilestone}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No milestones yet. Add your first milestone to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone) => {
              const isExpanded = expandedMilestones[milestone._id];
              const deliverableStats = getDeliverableStats(milestone.deliverables);
              
              return (
                <motion.div
                  key={milestone._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Milestone Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleMilestone(milestone._id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {milestone.name}
                          </h3>
                          {milestone.abbreviation && (
                            <Badge variant="outline" className="text-xs">
                              {milestone.abbreviation}
                            </Badge>
                          )}
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {milestone.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {milestone.teamMember && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {getTeamMemberName(milestone.teamMember)}
                            </div>
                          )}
                          {milestone.calculatedStartDate && milestone.calculatedEndDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDateDisplay(milestone.calculatedStartDate)} - {formatDateDisplay(milestone.calculatedEndDate)}
                            </div>
                          )}
                          <div>
                            Deliverables: {deliverableStats.completed}/{deliverableStats.total}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMilestone(milestone);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMilestone(milestone._id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Milestone Content (Deliverables) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="p-4 space-y-3">
                          {/* Deliverables */}
                          {milestone.deliverables && milestone.deliverables.length > 0 ? (
                            <div className="space-y-3">
                              {milestone.deliverables.map((deliverable) => {
                                const taskStats = getTaskStats(deliverable.tasks);
                                
                                return (
                                  <div
                                    key={deliverable._id}
                                    className="border border-gray-200 rounded-lg p-3 bg-white"
                                  >
                                    <div className="flex items-start gap-3">
                                      <button
                                        onClick={() => onToggleDeliverable(milestone._id, deliverable._id, deliverable.isCompleted)}
                                        className="mt-1"
                                      >
                                        {deliverable.isCompleted ? (
                                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        ) : (
                                          <Circle className="w-5 h-5 text-gray-400" />
                                        )}
                                      </button>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <h4 className={`font-medium ${deliverable.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                            {deliverable.title}
                                          </h4>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => onEditDeliverable(milestone._id, deliverable)}
                                            >
                                              <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => onDeleteDeliverable(milestone._id, deliverable._id)}
                                              className="text-red-600 hover:text-red-700"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                        {deliverable.description && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            {deliverable.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                          {deliverable.calculatedStartDate && deliverable.calculatedEndDate && (
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-4 h-4" />
                                              {formatDateDisplay(deliverable.calculatedStartDate)} - {formatDateDisplay(deliverable.calculatedEndDate)}
                                            </div>
                                          )}
                                          {deliverable.tasks && deliverable.tasks.length > 0 && (
                                            <div>
                                              Tasks: {taskStats.completed}/{taskStats.total}
                                            </div>
                                          )}
                                        </div>

                                        {/* Tasks */}
                                        {deliverable.tasks && deliverable.tasks.length > 0 && (
                                          <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
                                            {deliverable.tasks.map((task) => (
                                              <div
                                                key={task._id}
                                                className="flex items-start gap-2"
                                              >
                                                <button
                                                  onClick={() => onToggleTask(milestone._id, deliverable._id, task._id, task.isCompleted)}
                                                  className="mt-0.5"
                                                >
                                                  {task.isCompleted ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                  ) : (
                                                    <Circle className="w-4 h-4 text-gray-400" />
                                                  )}
                                                </button>
                                                <div className="flex-1">
                                                  <div className="flex items-center justify-between">
                                                    <span className={`text-sm ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                      {task.title}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEditTask(milestone._id, deliverable._id, task)}
                                                      >
                                                        <Edit2 className="w-3 h-3" />
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDeleteTask(milestone._id, deliverable._id, task._id)}
                                                        className="text-red-600 hover:text-red-700"
                                                      >
                                                        <Trash2 className="w-3 h-3" />
                                                      </Button>
                                                    </div>
                                                  </div>
                                                  {task.description && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                      {task.description}
                                                    </p>
                                                  )}
                                                  {task.calculatedDueDate && (
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                      <Clock className="w-3 h-3" />
                                                      Due: {formatDateDisplay(task.calculatedDueDate)}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Add Task Button */}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => onAddTask(milestone._id, deliverable._id)}
                                          className="mt-2 gap-2"
                                        >
                                          <Plus className="w-4 h-4" />
                                          Add Task
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500 text-sm">
                              No deliverables yet
                            </div>
                          )}

                          {/* Add Deliverable Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddDeliverable(milestone._id)}
                            className="w-full gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Deliverable
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MilestonesSection;
