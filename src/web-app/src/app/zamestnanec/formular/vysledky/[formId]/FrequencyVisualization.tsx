"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import DataVisualization from "./DataVisualization";
import stringifyResult from "./stringifyResult";

export const ChartTypes = {
    bar: "Sloupcový graf",
    pie: "Koláčový graf",
} as const;

export type ChartType = (typeof ChartTypes)[keyof typeof ChartTypes];

export default function FrequencyVisualization({
    data,
    labelKeyMap,
}: {
    data: { [key: string]: { value: unknown; label: string } }[];
    labelKeyMap: { [key: string]: string };
}) {
    const [isVisualizationModalShowing, setIsVisualizationModalShowing] =
        useState(false);
    const [fieldToVisualize, setFieldToVisualize] = useState(
        Object.keys(labelKeyMap).length > 0
            ? Object.keys(labelKeyMap)[0]
            : undefined
    );

    const [selectedChartType, setSelectedChartType] = useState<ChartType>(
        ChartTypes.bar
    );
    const valueFrequencies = useMemo(() => {
        if (!fieldToVisualize) return new Map<string, number>();

        const values = data.map((d) =>
            stringifyResult(d[fieldToVisualize].value)
        );
        return calculateFrequencies(values);
    }, [data, fieldToVisualize]);

    if (Object.keys(labelKeyMap).length === 0)
        return <Alert variant="danger">Žádná data k vizualizaci</Alert>;

    return (
        <>
            <Button
                variant="primary"
                onClick={() => setIsVisualizationModalShowing(true)}
            >
                Vizualizovat frekvence hodnot
            </Button>
            <Modal
                show={isVisualizationModalShowing}
                onHide={() => setIsVisualizationModalShowing(false)}
                size="xl"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Vizualizace frekvence hodnot</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <Form.Label htmlFor="field-to-visualize">
                            Vizualizované pole
                        </Form.Label>
                        <Form.Select
                            value={fieldToVisualize}
                            onChange={(e) =>
                                setFieldToVisualize(e.target.value)
                            }
                            id="field-to-visualize"
                        >
                            {Object.entries(labelKeyMap).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Label htmlFor="chart-type">Typ grafu</Form.Label>
                        <Form.Select
                            value={selectedChartType}
                            onChange={(e) =>
                                setSelectedChartType(
                                    e.target.value as ChartType
                                )
                            }
                            id="chart-type"
                        >
                            {Object.values(ChartTypes).map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </Form.Select>
                    </div>
                    <DataVisualization
                        data={Array.from(valueFrequencies.entries()).map(
                            ([k, v]) => ({
                                name: k,
                                value: v,
                            })
                        )}
                        chartType={selectedChartType}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}

function calculateFrequencies<TValue>(values: TValue[]) {
    const valueFrequencies = new Map<TValue, number>();
    for (const value of values) {
        if (!valueFrequencies.has(value)) valueFrequencies.set(value, 1);
        else valueFrequencies.set(value, valueFrequencies.get(value)! + 1);
    }
    return valueFrequencies;
}
