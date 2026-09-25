import { useEffect, useRef, useState } from "react";
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";

// Small dialog for renaming a chat. onSave(title) may be async.
const RenameChatModal = ({ isOpen, onClose, initialTitle, onSave }) => {
    const [title, setTitle] = useState(initialTitle || "");
    const [saving, setSaving] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) setTitle(initialTitle || "");
    }, [isOpen, initialTitle]);

    const save = async () => {
        const value = title.trim();
        if (!value) return;
        setSaving(true);
        try {
            await onSave(value);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={inputRef} isCentered size={{ base: "xs", sm: "md" }}>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderWidth="1px" borderColor="border.default">
                <ModalHeader fontSize="lg">Rename chat</ModalHeader>
                <ModalBody>
                    <Input
                        ref={inputRef}
                        value={title}
                        maxLength={80}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && save()}
                        fontSize="16px"
                    />
                </ModalBody>
                <ModalFooter gap={2}>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button colorScheme="blue" onClick={save} isLoading={saving} isDisabled={!title.trim()}>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default RenameChatModal;
