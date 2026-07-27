import { apiClient } from './apiClient';

const transformStep = (step) => ({
  id: step.id || `step-${step.step || step.order}`,
  order: step.order || step.step,
  title: step.title,
  description: step.description,
  role: step.roleLabel || step.role,
  slaDays: step.slaDays || step.sla_days,
});

export const validationFlowService = {
  async getFlow() {
    const response = await apiClient.get('/statistics/validation-flow');
    const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
    return list.map(transformStep).sort((a, b) => (a.order || 0) - (b.order || 0));
  },
};
