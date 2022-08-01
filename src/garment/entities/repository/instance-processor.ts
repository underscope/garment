import type { Repository } from '.'

function attachRepositoryToActivities(repository: Repository) {
  repository.structure.forEach(it => it.repository = repository)
  return repository
}

export default (repository: Repository) => {
  const processors = [
    attachRepositoryToActivities,
  ]
  processors.forEach(f => f(repository))
  return repository
}
