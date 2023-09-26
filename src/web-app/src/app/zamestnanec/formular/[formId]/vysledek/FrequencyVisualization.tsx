"use client";

import { useMemo, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import DataVisualization, { ChartType, ChartTypes } from "./DataVisualization";
import { LabeledDataValue } from "./ResultTable";
import stringifyResult from "./stringifyResult";

/**
 * Shows a button that opens a modal with a visualization of the frequency of values.
 * The user may select any field from the data to visualize. The user may select from
 * different chart types.
 * @param root0 - Props for the component.
 * @param root0.data - Data to visualize.
 * @param root0.labelKeyMap - Map of labels to keys in the data.
 */
export default function FrequencyVisualization({
    data,
    labelKeyMap,
}: {
    data: { [key: string]: LabeledDataValue }[];
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

        const values = data.map((dataEntry) => {
            const value = dataEntry[fieldToVisualize]?.value;
            if (value === undefined) return "Chybějící hodnota";

            return stringifyResult(value);
        });
        return calculateFrequencies(values);
    }, [data, fieldToVisualize]);

    const isDataEmpty = Object.keys(labelKeyMap).length === 0;

    return (
        <>
            <Button
                disabled={isDataEmpty}
                variant="primary"
                onClick={() => setIsVisualizationModalShowing(true)}
            >
                <i
                    className="bi bi-graph-up"
                    style={{
                        paddingRight: "5px",
                    }}
                ></i>
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
                    <Row>
                        <Col>
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
                        </Col>
                        <Col>
                            <Form.Label htmlFor="chart-type">
                                Typ grafu
                            </Form.Label>
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
                        </Col>
                    </Row>
                    <div className="mt-2">
                        <DataVisualization
                            data={Array.from(valueFrequencies.entries()).map(
                                ([k, v]) => ({
                                    name: k,
                                    value: v,
                                })
                            )}
                            chartType={selectedChartType}
                        />
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}

/**
 * Calculates frequencies of values.
 * @param values - Values to calculate frequencies of.
 */
function calculateFrequencies<TValue>(values: TValue[]) {
    const valueFrequencies = new Map<TValue, number>();
    for (const value of values) {
        if (!valueFrequencies.has(value)) valueFrequencies.set(value, 1);
        else valueFrequencies.set(value, valueFrequencies.get(value)! + 1);
    }
    return valueFrequencies;
}
