import type { EntityProcessorContext } from '../../interfaces'
import type { Repository } from '.'

function attachEnvironmentPath(item: Repository, context: EntityProcessorContext) {
  item.envPath = context.config[context.env]
  return item
}

function attachRepositoryIdToActivity(repository: Repository) {
  repository.structure.forEach((activity) => {
    activity.repositoryId = repository.id
  })
  return repository
}

export default (repository: Repository, context: EntityProcessorContext) => {
  const processors = [
    attachEnvironmentPath,
    attachRepositoryIdToActivity,
  ]
  processors.forEach(f => f(repository, context))
  return repository
}
