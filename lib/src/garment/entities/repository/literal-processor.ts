import type { Repository } from '.'
import type { EntityProcessorContext } from '../../interfaces'

function attachEnvironmentInfo(
  repository: Repository,
  context: EntityProcessorContext,
) {
  repository.env = context.env
  repository.envPath = context.config[context.env]
  return repository
}

export default (repository: Repository, context: EntityProcessorContext) => {
  const processors = [
    attachEnvironmentInfo,
  ]
  processors.forEach(f => f(repository, context))
  return repository
}
