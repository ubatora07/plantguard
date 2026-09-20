import type {
  AnalyzeRequest,
  DiagnosisProvider,
  DiagnosisProviderInfo,
  DiagnosisResult,
} from '../types';
import { cropById } from '../config';
import {
  DEMO_MODEL_VERSION,
  DEMO_NOT_CONNECTED,
  DEMO_SCENARIOS,
  type DemoScenario,
} from '../data/demo-scenarios';
import {
  CURRENT_CONTENT_VERSION,
  getConditionProfile,
} from '../data/knowledge-base';
import { DiagnosisError } from '../types';

/**
 * Offline demo provider.
 *
 * Honesty rules (SPEC/ARCHITECTURE.md):
 * - Demo outcomes are tied to explicitly selected bundled scenarios only.
 * - An arbitrary user photo NEVER receives a scenario diagnosis, a class or a
 *   confidence — it gets the honest "model not connected" status instead.
 * - Confidence values are the scenario's teaching values, not measured accuracy.
 */
export class DemoProvider implements DiagnosisProvider {
  readonly info: DiagnosisProviderInfo = {
    id: 'demo',
    mode: 'demo',
    modelVersion: DEMO_MODEL_VERSION,
    available: true,
  };

  /** Bundled scenarios, for the demo-examples screen. */
  listScenarios(): DemoScenario[] {
    return DEMO_SCENARIOS;
  }

  getScenario(id: string): DemoScenario | undefined {
    return DEMO_SCENARIOS.find((s) => s.id === id);
  }

  async analyze(request: AnalyzeRequest): Promise<DiagnosisResult> {
    // Explicit scenario request → the scenario's outcome.
    if (request.scenarioId) {
      const scenario = this.getScenario(request.scenarioId);
      if (!scenario) {
        throw new DiagnosisError('invalid_request', 'Неизвестный демонстрационный сценарий');
      }
      return this.resultFromScenario(scenario, request);
    }

    // Arbitrary photo in demo mode → honest "not connected" answer, no diagnosis.
    return {
      status: 'model_not_connected',
      resultOrigin: 'no_prediction',
      failureCode: 'model_not_connected',
      explanation: DEMO_NOT_CONNECTED.explanation,
      symptoms: [],
      recommendations: [...DEMO_NOT_CONNECTED.recommendations],
      avoid: [...DEMO_NOT_CONNECTED.avoid],
      isDemoScenario: false,
      modelVersion: DEMO_MODEL_VERSION,
      contentVersion: CURRENT_CONTENT_VERSION,
      limitsOfVisual:
        'В демонстрационном режиме модель компьютерного зрения не подключена. Анализ произвольных пользовательских фото не выполняется.',
    };
  }

  private resultFromScenario(
    scenario: DemoScenario,
    request: AnalyzeRequest,
  ): DiagnosisResult {
    if (request.cropId !== scenario.cropId) {
      throw new DiagnosisError('unsupported_crop', 'Сценарий не относится к выбранной культуре');
    }
    void cropById; // crop display name is resolved when composing the record

    // Resolve agronomic limits of visual diagnosis from knowledge base
    const conditionId = scenario.id.replace(/-demo$/, '');
    const profile = getConditionProfile(conditionId);

    return {
      status: this.statusForScenario(scenario),
      resultOrigin: 'demo_sample',
      diagnosisClass: scenario.label,
      diagnosisClassLatin: scenario.latinName,
      // Only defined when the scenario carries a teaching confidence value.
      confidence: scenario.confidence ?? undefined,
      explanation: scenario.description,
      symptoms: [...scenario.symptoms],
      recommendations: [...scenario.recommendations],
      avoid: [...scenario.avoid],
      symptomHotspots: scenario.symptomHotspots,
      isDemoScenario: true,
      scenarioId: scenario.id,
      modelVersion: DEMO_MODEL_VERSION,
      contentVersion: CURRENT_CONTENT_VERSION,
      limitsOfVisual: profile?.limitsOfVisual,
    };
  }

  private statusForScenario(scenario: DemoScenario) {
    if (scenario.id === 'tomato-healthy-demo') return 'no_signs' as const;
    if (scenario.confidence === null) return 'insufficient_data' as const;
    return 'prediction' as const;
  }
}
