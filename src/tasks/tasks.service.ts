import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async findAll(projectId?: number, status?: TaskStatus, assigneeId?: number) {
    const query = this.tasksRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.project', 'project');

    if (projectId) {
      query.andWhere('task.projectId = :projectId', { projectId });
    }
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (assigneeId) {
      query.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }

    return query.orderBy('task.createdAt', 'DESC').getMany();
  }

  async findOne(id: number) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignee', 'project'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async create(data: CreateTaskDto) {
    const task = this.tasksRepository.create(data);
    return this.tasksRepository.save(task);
  }

  async update(id: number, data: UpdateTaskDto) {
    const task = await this.findOne(id);
    Object.assign(task, data);
    return this.tasksRepository.save(task);
  }

  async remove(id: number) {
    const task = await this.findOne(id);
    return this.tasksRepository.remove(task);
  }
}
