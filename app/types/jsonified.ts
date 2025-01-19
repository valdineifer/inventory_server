import { SerializeFrom } from '@remix-run/node';
import { Computer } from './models';
import { getLaboratoryDetails } from '~/.server/services/laboratoryService';

export type ComputerJsonified = SerializeFrom<Computer>;

export type GroupJsonified = SerializeFrom<typeof getLaboratoryDetails>;