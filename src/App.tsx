
import { Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { FormBuilder } from './pages/FormBuilder'
import { FormView } from './pages/FormView'
import { FormResponses } from './pages/FormResponses'
import { Layout } from './components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="forms/new" element={<FormBuilder />} />
        <Route path="forms/:formId/edit" element={<FormBuilder />} />
        <Route path="forms/:formId/responses" element={<FormResponses />} />
      </Route>
      <Route path="f/:publicUrl" element={<FormView />} />
    </Routes>
  )
}

export default App