"use client";

import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import TaskCreationForm from "../TaskCreationForm";

/**
 * Renders a button that opens a modal with a form for creating a new task.
 */
export default function TaskCreationToolbarItem() {
    const [showTaskCreationModal, setShowTaskCreationModal] = useState(false);
    return (
        <>
            <Button
                variant="primary"
                onClick={() => setShowTaskCreationModal(true)}
            >
                <i
                    className="bi bi-plus-lg"
                    style={{
                        paddingRight: "5px",
                    }}
                ></i>
                Nový úkol
            </Button>
            <Modal
                show={showTaskCreationModal}
                onHide={() => setShowTaskCreationModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Zadání úkolu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TaskCreationForm
                        onSettled={() => setShowTaskCreationModal(false)}
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}
