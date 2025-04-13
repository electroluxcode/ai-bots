import { createFileRoute } from '@tanstack/react-router';
import { FlowPage } from '../pages/FlowPage';

export const Route = createFileRoute('/')({
  component: FlowPage,
}); 