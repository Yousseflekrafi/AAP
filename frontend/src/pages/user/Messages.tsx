import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentOrganization } from "../../hooks/useCurrentOrganization";
import * as organizationsService from "../../services/organizationsService";
import * as adminMessagesService from "../../services/adminMessagesService";
import type { AdminConversation } from "../../types/adminMessages";
import { Loader } from "../../reusedComponents/Loader";
import { ErrorState } from "../../reusedComponents/ErrorState";
import { Icon } from "../../reusedComponents/Icon";
import { Modal } from "../../reusedComponents/Modal";
import { useAuth } from "../../hooks/useAuth";

type Tab = "team" | "support";

export default function Messages() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("team");
  const { organization, loading: orgLoading, error: orgError } = useCurrentOrganization();

  if (orgLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader />
      </div>
    );
  }

  if (orgError || !organization) {
    return <ErrorState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        <Icon name="chat" className="text-brand-600" />
        {t("nav.messages")}
      </h1>

      <div className="flex gap-1">
        {(["team", "support"] as Tab[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              tab === value
                ? "bg-brand-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {value === "team" ? t("messages.team") : t("messages.support")}
          </button>
        ))}
      </div>

      {tab === "team" ? <TeamChat organizationId={organization.id} /> : <SupportConversations />}
    </div>
  );
}

function TeamChat({ organizationId }: { organizationId: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [dmWith, setDmWith] = useState("");

  const { data: members } = useQuery({
    queryKey: ["members", organizationId],
    queryFn: () => organizationsService.fetchMembers(organizationId),
  });
  const teammates = members?.results.filter((m) => m.user !== user?.id) ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["org-messages", organizationId, dmWith],
    queryFn: () => organizationsService.fetchOrgMessages(organizationId, dmWith || undefined),
    refetchInterval: 15000,
  });

  const sendMutation = useMutation({
    mutationFn: () => organizationsService.sendOrgMessage(organizationId, message, dmWith || undefined),
    onSuccess: () => {
      setMessage("");
      void queryClient.invalidateQueries({ queryKey: ["org-messages", organizationId, dmWith] });
    },
  });

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">{t("messages.teamHelp")}</p>
        {teammates.length > 0 && (
          <select
            value={dmWith}
            onChange={(e) => setDmWith(e.target.value)}
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">{t("messages.everyone")}</option>
            {teammates.map((m) => (
              <option key={m.user} value={m.user}>
                {m.user_name} — {t(`organization.${m.role}`)}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3">
        {isLoading && <Loader size="sm" />}
        {data?.results.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">{t("common.noData")}</p>
        )}
        {data?.results.map((m) => (
          <div key={m.id} className="text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {m.sender_name} <span className="font-normal text-gray-400">· {new Date(m.created_at).toLocaleString()}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">{m.message}</p>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) sendMutation.mutate();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("messages.writeMessage")}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <button
          type="submit"
          disabled={sendMutation.isPending}
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {t("messages.send")}
        </button>
      </form>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_for_admin: "Waiting for AAP",
  waiting_for_super_admin: "Waiting for AAP",
  resolved: "Resolved",
  closed: "Closed",
};

function SupportConversations() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [active, setActive] = useState<AdminConversation | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["my-conversations"],
    queryFn: () => adminMessagesService.fetchConversations(1),
  });

  const createMutation = useMutation({
    mutationFn: () => adminMessagesService.createConversation(subject),
    onSuccess: () => {
      setSubject("");
      setShowNew(false);
      void queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">{t("messages.supportHelp")}</p>
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          {t("messages.newConversation")}
        </button>
      </div>

      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm shadow-gray-900/5 dark:shadow-none">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader size="sm" />
          </div>
        )}
        {data?.results.length === 0 && !isLoading && (
          <p className="py-8 text-center text-sm text-gray-400">{t("common.noData")}</p>
        )}
        {data?.results.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="font-medium text-gray-900 dark:text-gray-100">{c.subject}</span>
            <span className="text-xs text-gray-400">{STATUS_LABEL[c.status]}</span>
          </button>
        ))}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.subject}>
        {active && <SupportThread conversation={active} />}
      </Modal>

      <Modal open={showNew} onClose={() => setShowNew(false)} title={t("messages.newConversation")}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (subject.trim()) createMutation.mutate();
          }}
          className="flex flex-col gap-3"
        >
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("messages.subject")}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {t("common.submit")}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function SupportThread({ conversation }: { conversation: AdminConversation }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["conversation-messages", conversation.id],
    queryFn: () => adminMessagesService.fetchMessages(conversation.id),
  });

  const sendMutation = useMutation({
    mutationFn: () => adminMessagesService.sendMessage(conversation.id, reply),
    onSuccess: () => {
      setReply("");
      void queryClient.invalidateQueries({ queryKey: ["conversation-messages", conversation.id] });
      void queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-72 overflow-y-auto rounded-md bg-gray-50 dark:bg-gray-800/60 p-3">
        {isLoading && <Loader size="sm" />}
        {messages?.results.map((m) => (
          <div key={m.id} className="mb-3 text-sm">
            <p className="font-medium text-gray-900 dark:text-gray-100">{m.sender_email}</p>
            <p className="text-gray-600 dark:text-gray-300">{m.message}</p>
            <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (reply.trim()) sendMutation.mutate();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={t("messages.writeMessage")}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <button type="submit" className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
          {t("messages.send")}
        </button>
      </form>
    </div>
  );
}
