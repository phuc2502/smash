import { useSearchParams } from 'react-router-dom';
import GradingPage from './GradingPage';
import EssayGradingPage from './EssayGradingPage';

/** Preserve the gradebook at /grading; assignment grading links open the essay workflow. */
export default function GradingRoutePage() {
  const [searchParams] = useSearchParams();
  return searchParams.has('assignmentId') ? <EssayGradingPage /> : <GradingPage />;
}
