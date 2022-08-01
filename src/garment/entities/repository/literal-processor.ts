import type { EntityProcessorContext } from '../../interfaces'
import type { Repository } from '.'

function attachEnvironmentPath(
  repository: Repository,
  context: EntityProcessorContext) {
  repository.envPath = context.config[context.env]
  return repository
}

export default (repository: Repository, context: EntityProcessorContext) => {
  const processors = [
    attachEnvironmentPath,
  ]
  processors.forEach(f => f(repository, context))
  return repository
}
