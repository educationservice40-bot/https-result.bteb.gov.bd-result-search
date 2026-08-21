import { isResultPath, usePath } from './router'
import { SearchPage } from './components/SearchPage'
import { ResultPage } from './components/ResultPage'

export function App() {
  const [path, navigate] = usePath()
  return isResultPath(path) ? (
    <ResultPage navigate={navigate} />
  ) : (
    <SearchPage navigate={navigate} />
  )
}
