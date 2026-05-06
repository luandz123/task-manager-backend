import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async findAll(userId: number) {
    return this.projectsRepository.find({
      where: [
        { ownerId: userId },
        // Could add projects where user is assigned to tasks if needed
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['tasks', 'tasks.assignee', 'owner'],
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async create(userId: number, data: CreateProjectDto) {
    const project = this.projectsRepository.create({
      ...data,
      ownerId: userId,
    });
    return this.projectsRepository.save(project);
  }

  async remove(userId: number, id: number) {
    const project = await this.findOne(id);
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete this project');
    }
    return this.projectsRepository.remove(project);
  }
}
