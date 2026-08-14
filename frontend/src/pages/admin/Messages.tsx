import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  closeConversation,
  createConversation,
  fetchConversations,
  fetchMessages,
  sendMessage,
} from "../../services/adminMessagesService";
import { DataTable, type DataTableColumn } from "../../reusedComponents/DataTable";
import { Modal } from "../../reusedComponents/Modal";
import { Loader } from "../../reusedComponents/Loader";
import type { AdminConversation } from "../../types/adminMessages";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_for_admin: "Waiting for admin",
  waiting_for_super_admin: "Waiting for super admin",
  resolved: "Resolved",
  closed: "Closed",
};

function ConversationThread({ conversation, onClose }: { conversation: AdminConversation; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-messages", conversation.id],
    queryFn: () => fetchMessages(conversation.id),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-messages", conversation.id] });
    void queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    await sendMessage(conversation.id, reply);
    setReply("");
    refresh();
  };

  const isClosed = conversation.status === "closed" || conversation.status === "resolved";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{STATUS_LABEL[conversation.status]} · {conversation.priority}</span>
        <button
          type="button"
          onClick={async () => {
            await closeConversation(conversation.id, isClosed ? "open" : "closed");
            refresh();
          }}
          className="text-brand-600 hover:underline"
        >
          {isClosed ? "Reopen" : "Close"}
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-800 p-3">
        {isLoading && <Loader size="sm" />}
        {messages?.results.map((m) => (
          <div key={m.id} className="mb-3 text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">{m.sender_email}</p>
            <p className="text-gray-600 dark:text-gray-300">{m.message}</p>
            <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => void handleSend(e)} className="flex gap-2">
        <input
          type="text"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply..."
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Send
        </button>
      </form>

      <button type="button" onClick={onClose} className="self-end text-xs text-gray-400 hover:underline">
        Close panel
      </button>
    </div>
  );
}

export default function Messages() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [active, setActive] = useState<AdminConversation | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-conversations"],
    queryFn: () => fetchConversations(1),
  });

  const columns: DataTableColumn<AdminConversation>[] = [
    { key: "subject", header: "Subject" },
    { key: "created_by_email", header: "From" },
    { key: "status", header: "Status", render: (c) => STATUS_LABEL[c.status] },
    { key: "priority", header: "Priority" },
    { key: "updated_at", header: "Updated", render: (c) => new Date(c.updated_at).toLocaleString() },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    await createConversation(subject);
    setSubject("");
    setShowNew(false);
    void queryClient.invalidateQueries({ queryKey: ["admin-conversations"] });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Messages</h1>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          New conversation
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={data?.results ?? []}
        rowKey={(c) => c.id}
        loading={isLoading}
        onRowClick={setActive}
      />

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.subject}>
        {active && <ConversationThread conversation={active} onClose={() => setActive(null)} />}
      </Modal>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Contact platform support">
        <form onSubmit={(e) => void handleCreate(e)} className="flex flex-col gap-3">
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
            {t("common.submit")}
          </button>
        </form>
      </Modal>
    </div>
  );
}
