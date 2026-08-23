"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Archive,
  ChevronDown,
  Filter,
  LayoutGrid,
  Loader2,
  Plus,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { coursesApi, kanbanApi } from "@/lib/api";
import PlannerCard from "./PlannerCard";
import PlannerColumn from "./PlannerColumn";
import CardDetailDrawer from "./CardDetailDrawer";
import {
  CARD_TYPES,
  PRIORITIES,
  PRIORITY_WEIGHT,
  TEMPLATES,
} from "./planner-constants";

const unwrap = (response) => response?.data?.data;
const getColumnId = (card) =>
  typeof card.column === "string" ? card.column : card.column?._id;
const isDoneColumn = (column) => /done|published/i.test(column?.name || "");

export default function PlannerPage() {
  const [boards, setBoards] = useState([]);
  const [boardId, setBoardId] = useState("");
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [archivedColumns, setArchivedColumns] = useState([]);
  const [cards, setCards] = useState([]);
  const [labels, setLabels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    variant: "default",
    onConfirm: () => {},
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const closeConfirm = () => {
    setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const showConfirm = ({ title, description, confirmText, variant, onConfirm }) => {
    setConfirmConfig({
      isOpen: true,
      title,
      description,
      confirmText,
      variant,
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await onConfirm();
          closeConfirm();
        } catch (e) {
          // Handled in callback
        } finally {
          setConfirmLoading(false);
        }
      },
    });
  };

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const taskIdParam = searchParams.get("task");
  const modeParam = searchParams.get("mode");

  const [activeCard, setActiveCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardModalMode, setCardModalMode] = useState("view");

  const updateTaskUrl = useCallback(
    (taskId, mode) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (taskId) {
        params.set("task", taskId);
        if (mode && mode !== "view") {
          params.set("mode", mode);
        } else {
          params.delete("mode");
        }
      } else {
        params.delete("task");
        params.delete("mode");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const openCardModal = useCallback(
    (card, mode = "view") => {
      setSelectedCard(card);
      setCardModalMode(mode);
      const taskId = card?._id || (mode === "create" ? "new" : null);
      if (taskId) {
        updateTaskUrl(taskId, mode);
      }
    },
    [updateTaskUrl],
  );

  const closeCardModal = useCallback(() => {
    setSelectedCard(null);
    updateTaskUrl(null, null);
  }, [updateTaskUrl]);

  const changeCardModalMode = useCallback(
    (newMode) => {
      setCardModalMode(newMode);
      if (selectedCard) {
        const taskId = selectedCard._id || "new";
        updateTaskUrl(taskId, newMode);
      }
    },
    [selectedCard, updateTaskUrl],
  );

  useEffect(() => {
    if (!taskIdParam) {
      if (selectedCard) setSelectedCard(null);
      return;
    }

    if (taskIdParam === "new") {
      if (!selectedCard || selectedCard._id) {
        setSelectedCard({
          title: "",
          description: "",
          column: columns[0]?._id || "",
          type: "Feature",
          priority: "Medium",
        });
        setCardModalMode("create");
      }
      return;
    }

    if (cards.length > 0) {
      const found = cards.find((card) => card._id === taskIdParam);
      if (found) {
        if (selectedCard?._id !== found._id || cardModalMode !== (modeParam || "view")) {
          setSelectedCard(found);
          setCardModalMode(modeParam === "edit" ? "edit" : "view");
        }
      }
    }
  }, [taskIdParam, modeParam, cards, columns]);

  const [quickTitle, setQuickTitle] = useState("");
  const [activeColumnTab, setActiveColumnTab] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    priority: "all",
    label: "all",
    course: "all",
    status: "all",
    due: "all",
    sort: "position",
  });
  const searchRef = useRef(null);
  const columnRefs = useRef({});
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

  const scrollToColumn = (colId) => {
    setActiveColumnTab(colId);
    columnRefs.current[colId]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const loadBoards = useCallback(async () => {
    const [boardsResponse, coursesResponse] = await Promise.all([
      kanbanApi.boards(),
      coursesApi.listAll(),
    ]);
    if (!boardsResponse.success)
      return toast.error(boardsResponse.error || "Unable to load planner");
    const nextBoards = unwrap(boardsResponse) || [];
    setBoards(nextBoards);
    setBoardId((current) => current || nextBoards[0]?._id || "");
    if (coursesResponse.success)
      setCourses(
        unwrap(coursesResponse)?.data || unwrap(coursesResponse) || [],
      );
  }, []);

  const loadBoard = useCallback(async (id, quiet = false) => {
    if (!id) return;
    if (!quiet) setLoading(true);
    const response = await kanbanApi.getBoard(id);
    if (response.success) {
      const payload = unwrap(response);
      setBoard(payload.board);
      setColumns(payload.columns || []);
      setArchivedColumns(payload.archivedColumns || []);
      setCards(payload.cards || []);
      setLabels(payload.labels || []);
      if (payload.columns?.length > 0)
        setActiveColumnTab(payload.columns[0]._id);
    } else toast.error(response.error || "Unable to load board");
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]); // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (boardId) loadBoard(boardId);
  }, [boardId, loadBoard]); // eslint-disable-line react-hooks/set-state-in-effect

  useEffect(() => {
    const refresh = () => boardId && loadBoard(boardId, true);
    window.addEventListener("planner:task-created", refresh);
    return () => window.removeEventListener("planner:task-created", refresh);
  }, [boardId, loadBoard]);
  useEffect(() => {
    const keydown = (event) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(
        document.activeElement?.tagName,
      );
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key.toLowerCase() === "n" && !typing && !selectedCard) {
        event.preventDefault();
        document.getElementById("planner-quick-title")?.focus();
      }
      if (event.key === "Escape") setSelectedCard(null);
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [selectedCard]);

  const visibleCards = useMemo(() => {
    const now = new Date();
    const week = new Date(now);
    week.setDate(now.getDate() + 7);
    const filtered = cards.filter((card) => {
      const text =
        `${card.title} ${card.description || ""} ${card.seo?.primaryKeyword || ""} ${card.labels?.map((label) => label.name).join(" ")}`.toLowerCase();
      const due = card.dueDate ? new Date(card.dueDate) : null;
      return (
        (!filters.search || text.includes(filters.search.toLowerCase())) &&
        (filters.type === "all" || card.type === filters.type) &&
        (filters.priority === "all" || card.priority === filters.priority) &&
        (filters.label === "all" ||
          card.labels?.some((label) => label._id === filters.label)) &&
        (filters.course === "all" ||
          (typeof card.parentCourse === "string"
            ? card.parentCourse
            : card.parentCourse?._id) === filters.course) &&
        (filters.status === "all" || getColumnId(card) === filters.status) &&
        (filters.due === "all" ||
          (filters.due === "overdue" &&
            due &&
            due < now &&
            !isDoneColumn(
              columns.find((column) => column._id === getColumnId(card)),
            )) ||
          (filters.due === "week" && due && due >= now && due <= week) ||
          (filters.due === "none" && !due))
      );
    });
    if (filters.sort === "priority")
      return [...filtered].sort(
        (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
      );
    if (filters.sort === "due")
      return [...filtered].sort(
        (a, b) =>
          (a.dueDate ? new Date(a.dueDate) : Infinity) -
          (b.dueDate ? new Date(b.dueDate) : Infinity),
      );
    if (filters.sort === "activity")
      return [...filtered].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
    return filtered;
  }, [cards, columns, filters]);

  const stats = useMemo(
    () => ({
      total: cards.length,
      planned: cards.filter((card) =>
        /planned/i.test(
          columns.find((column) => column._id === getColumnId(card))?.name ||
            "",
        ),
      ).length,
      progress: cards.filter((card) =>
        /in progress/i.test(
          columns.find((column) => column._id === getColumnId(card))?.name ||
            "",
        ),
      ).length,
      overdue: cards.filter(
        (card) =>
          card.dueDate &&
          new Date(card.dueDate) < new Date() &&
          !isDoneColumn(
            columns.find((column) => column._id === getColumnId(card)),
          ),
      ).length,
      done: cards.filter((card) =>
        isDoneColumn(
          columns.find((column) => column._id === getColumnId(card)),
        ),
      ).length,
    }),
    [cards, columns],
  );

  const createCard = async (column, title, extra = {}) => {
    const response = await kanbanApi.createCard(boardId, {
      title,
      column,
      ...extra,
    });
    if (response.success) {
      const card = unwrap(response);
      setCards((current) => [...current, card]);
      toast.success("Card added");
      return card;
    }
    toast.error(response.error || "Unable to add card");
  };
  const submitQuick = async (event) => {
    event.preventDefault();
    const title = quickTitle.trim();
    if (!title || !columns[0]) return;
    const targetCol = columns.some((c) => c._id === activeColumnTab)
      ? activeColumnTab
      : columns[0]._id;
    setQuickTitle("");
    await createCard(targetCol, title);
  };
  const createFromType = async (type) => {
    if (!columns[0]) return;
    const targetCol = columns.some((c) => c._id === activeColumnTab)
      ? activeColumnTab
      : columns[0]._id;

    let templateData = {};
    let title = "";
    if (type === "SEO") {
      templateData = TEMPLATES["SEO Task"] || {};
      title = "New SEO Task";
    } else if (type === "Development") {
      templateData = TEMPLATES.Feature || {};
      title = "New Development Task";
    } else if (type === "Content") {
      templateData = TEMPLATES.Article || {};
      title = "New Content Task";
    }

    const card = await createCard(targetCol, title, templateData);
    if (card) openCardModal(card, "edit");
  };

  const saveCard = async (draft) => {
    if (!draft._id) {
      const created = await createCard(
        draft.column || columns[0]?._id,
        draft.title,
        draft,
      );
      if (created) {
        openCardModal(created, "view");
      }
      return created;
    }

    const old = cards.find((item) => item._id === draft._id);
    const payload = {
      ...draft,
      labels: draft.labels?.map((label) => label._id || label),
      parentCourse: draft.parentCourse?._id || draft.parentCourse || null,
      parentCard: draft.parentCard?._id || draft.parentCard || null,
    };
    setCards((current) =>
      current.map((item) => (item._id === draft._id ? draft : item)),
    );
    const response = await kanbanApi.updateCard(draft._id, payload);
    if (response.success) {
      const updated = unwrap(response);
      setCards((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
      setSelectedCard(updated);
      updateTaskUrl(updated._id, "view");
      toast.success("Card saved");
      return updated;
    } else {
      setCards((current) =>
        current.map((item) => (item._id === old._id ? old : item)),
      );
      toast.error(response.error || "Save failed; changes rolled back");
      return null;
    }
  };

  const archiveCard = async (card) => {
    const response = await kanbanApi.updateCard(card._id, {
      archived: true,
      activityDetail: "Card archived",
    });
    if (response.success) {
      setCards((current) => current.filter((item) => item._id !== card._id));
      closeCardModal();
      toast.success("Card archived");
    } else toast.error(response.error);
  };

  const duplicateCard = async (card) => {
    const response = await kanbanApi.duplicateCard(card._id);
    if (response.success) {
      const duplicated = unwrap(response);
      setCards((current) => [...current, duplicated]);
      openCardModal(duplicated, "view");
      toast.success("Card duplicated");
    } else toast.error(response.error);
  };

  const deleteCard = (card) => {
    showConfirm({
      title: "Delete task?",
      description: `Permanently delete “${card.title}”? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        const response = await kanbanApi.deleteCard(card._id);
        if (response.success) {
          setCards((current) => current.filter((item) => item._id !== card._id));
          closeCardModal();
          toast.success("Card deleted");
        } else {
          toast.error(response.error || "Unable to delete task");
        }
      },
    });
  };
  const createLabel = async (name) => {
    const response = await kanbanApi.createLabel(boardId, { name });
    if (response.success) {
      const label = unwrap(response);
      setLabels((current) => [...current, label]);
      return label;
    }
    toast.error(response.error);
  };

  const persistCardOrder = async (nextCards, previousCards) => {
    const items = columns.flatMap((column) =>
      nextCards
        .filter((card) => getColumnId(card) === column._id)
        .map((card, order) => ({ id: card._id, column: column._id, order })),
    );
    const response = await kanbanApi.reorderCards(boardId, items);
    if (!response.success) {
      setCards(previousCards);
      toast.error("Move failed; card returned to its previous position");
    }
  };
  const dragEnd = ({ active, over }) => {
    setActiveCard(null);
    if (!over || active.id === over.id) return;
    if (String(active.id).startsWith("column:")) {
      const oldIndex = columns.findIndex(
        (item) => `column:${item._id}` === active.id,
      );
      const newIndex = columns.findIndex(
        (item) => `column:${item._id}` === over.id,
      );
      if (oldIndex < 0 || newIndex < 0) return;
      const previous = columns;
      const next = arrayMove(columns, oldIndex, newIndex);
      setColumns(next);
      kanbanApi
        .reorderColumns(
          boardId,
          next.map((item) => ({ id: item._id })),
        )
        .then((response) => {
          if (!response.success) {
            setColumns(previous);
            toast.error("Column order could not be saved");
          }
        });
      return;
    }
    const cardId = String(active.id).replace("card:", "");
    const moving = cards.find((item) => item._id === cardId);
    if (!moving) return;
    const overId = String(over.id);
    const overCard = overId.startsWith("card:")
      ? cards.find((item) => item._id === overId.replace("card:", ""))
      : null;
    const targetColumn = overCard
      ? getColumnId(overCard)
      : overId.replace("drop:", "").replace("column:", "");
    if (!columns.some((column) => column._id === targetColumn)) return;
    const previous = cards;
    const without = cards.filter((item) => item._id !== cardId);
    const targetCards = without.filter(
      (item) => getColumnId(item) === targetColumn,
    );
    const targetIndex = overCard
      ? targetCards.findIndex((item) => item._id === overCard._id)
      : targetCards.length;
    const moved = { ...moving, column: targetColumn };
    const anchor = overCard
      ? without.findIndex((item) => item._id === overCard._id)
      : without.length;
    const next = [...without];
    next.splice(overCard ? anchor : next.length, 0, moved);
    if (targetIndex < 0) next.push(moved);
    setCards(next);
    persistCardOrder(next, previous);
  };

  const addBoard = async () => {
    const name = window.prompt("Board name");
    if (!name?.trim()) return;
    const response = await kanbanApi.createBoard({ name: name.trim() });
    if (response.success) {
      const created = unwrap(response);
      setBoards((current) => [...current, created]);
      setBoardId(created._id);
      toast.success("Board created");
    } else toast.error(response.error);
  };
  const renameBoard = async () => {
    const name = window.prompt("Rename board", board.name);
    if (!name?.trim()) return;
    const response = await kanbanApi.updateBoard(boardId, {
      name: name.trim(),
    });
    if (response.success) {
      setBoard(unwrap(response));
      setBoards((current) =>
        current.map((item) => (item._id === boardId ? unwrap(response) : item)),
      );
    } else toast.error(response.error);
  };
  const archiveBoard = () => {
    showConfirm({
      title: "Archive board?",
      description: `Are you sure you want to archive “${board?.name}”?`,
      confirmText: "Archive",
      variant: "warning",
      onConfirm: async () => {
        const response = await kanbanApi.updateBoard(boardId, { archived: true });
        if (response.success) {
          const next = boards.filter((item) => item._id !== boardId);
          setBoards(next);
          setBoardId(next[0]?._id || "");
          toast.success("Board archived");
        } else {
          toast.error(response.error || "Unable to archive board");
        }
      },
    });
  };
  const addColumn = async () => {
    const name = window.prompt("Column name");
    if (!name?.trim()) return;
    const response = await kanbanApi.createColumn(boardId, {
      name: name.trim(),
    });
    if (response.success) {
      const created = unwrap(response);
      setColumns((current) => [...current, created]);
      setActiveColumnTab((current) => current || created._id);
    } else toast.error(response.error);
  };
  const renameColumn = async (column) => {
    const name = window.prompt("Rename column", column.name);
    if (!name?.trim()) return;
    const response = await kanbanApi.updateColumn(column._id, {
      name: name.trim(),
    });
    if (response.success)
      setColumns((current) =>
        current.map((item) =>
          item._id === column._id ? unwrap(response) : item,
        ),
      );
    else toast.error(response.error);
  };
  const archiveColumn = (column) => {
    showConfirm({
      title: "Archive column?",
      description: `Archive “${column.name}”? Its cards will move to the first available column.`,
      confirmText: "Archive",
      variant: "warning",
      onConfirm: async () => {
        const response = await kanbanApi.archiveColumn(column._id);
        if (response.success) {
          loadBoard(boardId, true);
        } else {
          toast.error(response.error || "Unable to archive column");
        }
      },
    });
  };
  const unarchiveColumn = async (column) => {
    const response = await kanbanApi.updateColumn(column._id, {
      archived: false,
    });
    if (response.success) {
      toast.success(`Restored column “${column.name}”`);
      loadBoard(boardId, true);
    } else toast.error(response.error);
  };
  const clearFilters = () =>
    setFilters({
      search: "",
      type: "all",
      priority: "all",
      label: "all",
      course: "all",
      status: "all",
      due: "all",
      sort: "position",
    });

  const toggleTodoDone = async (card) => {
    const currentColumn = columns.find(
      (column) => column._id === getColumnId(card),
    );
    const doneColumn = columns.find(isDoneColumn);
    const openColumn = columns.find((column) => !isDoneColumn(column));
    const targetColumn = isDoneColumn(currentColumn) ? openColumn : doneColumn;

    if (!targetColumn) return;

    const response = await kanbanApi.updateCard(card._id, {
      column: targetColumn._id,
    });

    if (response.success) {
      await loadBoard(boardId, true);
    } else {
      toast.error(response.error || "Unable to update task");
    }
  };

  if (loading && !board)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={30} />
      </div>
    );
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      <div className="shrink-0 border-b border-zinc-200 bg-zinc-100 py-1.5 px-4 dark:border-zinc-800 dark:bg-zinc-950 md:px-6">
        <div className="flex flex-col gap-1.5 sm:gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center min-w-0">
                  <Select value={boardId} onValueChange={setBoardId}>
                    <SelectTrigger className="h-auto p-0 border-0 bg-transparent text-base sm:text-xl font-black shadow-none focus-visible:ring-0 [&_svg]:size-4 hover:opacity-80">
                      <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((item) => (
                        <SelectItem
                          key={item._id}
                          value={item._id}
                          className="font-bold"
                        >
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form
              onSubmit={submitQuick}
              className="flex min-w-full sm:min-w-60 flex-1 items-center rounded-2xl bg-white px-3 dark:bg-zinc-900 xl:w-80 border border-zinc-200 dark:border-zinc-800"
            >
              <Plus size={16} className="text-blue-600 shrink-0" />
              <input
                id="planner-quick-title"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Quick add card… (N)"
                className="h-9 sm:h-11 min-w-0 flex-1 px-2 text-xs sm:text-sm outline-none"
              />
              <button className="text-[10px] font-bold text-zinc-400 shrink-0">
                ENTER
              </button>
            </form>

            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <Select onValueChange={(value) => createFromType(value)}>
                <SelectTrigger className="h-9 sm:h-10 w-40 text-xs rounded-xl border border-zinc-200 bg-white px-3 font-semibold dark:border-zinc-700 dark:bg-zinc-950">
                  <Plus size={14} className="mr-1.5 inline-block text-blue-600 shrink-0" />
                  <SelectValue placeholder="Add Task Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEO">SEO</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Content">Content</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={addColumn}
                className="h-9 sm:h-10 text-xs"
              >
                <Plus size={15} /> Column
              </Button>
              <div className="group relative">
                <Button variant="outline" size="sm" className="h-9 sm:h-10">
                  <Settings2 size={15} />
                </Button>
                <div className="invisible absolute right-0 top-full mt-1.5 z-40 w-40 rounded-2xl border border-zinc-200 bg-white p-1 opacity-0 shadow-xl group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 dark:border-zinc-800 dark:bg-zinc-950 before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']">
                  <button
                    onClick={renameBoard}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Rename board
                  </button>
                  <button
                    onClick={addBoard}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Create board
                  </button>
                  <button
                    onClick={archiveBoard}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Archive size={13} /> Archive board
                  </button>
                  {archivedColumns.length > 0 && (
                    <>
                      <div className="border-t border-zinc-100 dark:border-zinc-800/80 my-1"></div>
                      <div className="px-3 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                        Restore Columns
                      </div>
                      {archivedColumns.map((col) => (
                        <button
                          key={col._id}
                          onClick={() => unarchiveColumn(col)}
                          className="w-full rounded-xl px-3 py-1.5 text-left text-[11px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{col.name}</span>
                          <span className="text-[10px] text-blue-600 font-bold shrink-0">
                            Restore
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex mt-2 sm:mt-3.5 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="hidden items-center overflow-x-auto gap-1 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900 scrollbar-none sm:grid sm:grid-cols-5">
            {[
              ["Total", stats.total],
              ["Planned", stats.planned],
              ["In progress", stats.progress],
              ["Overdue", stats.overdue],
              ["Done", stats.done],
            ].map(([name, value]) => (
              <div
                key={name}
                className="min-w-16 flex-1 rounded-xl bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-center dark:bg-zinc-950 shrink-0 sm:shrink"
              >
                <p
                  className={`text-sm sm:text-base font-black ${name === "Overdue" && value ? "text-red-600" : ""}`}
                >
                  {value}
                </p>
                <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-zinc-400 truncate">
                  {name}
                </p>
              </div>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 lg:max-w-2xl">
            <div className="flex h-9 sm:h-11 min-w-0 flex-1 items-center rounded-2xl border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
              <Search size={14} className="text-zinc-400 shrink-0" />
              <input
                ref={searchRef}
                value={filters.search}
                onChange={(e) =>
                  setFilters((current) => ({
                    ...current,
                    search: e.target.value,
                  }))
                }
                placeholder="Search every card… /"
                className="min-w-0 flex-1 bg-transparent px-2 text-xs sm:text-sm outline-none"
              />
              {filters.search && (
                <button
                  onClick={() =>
                    setFilters((current) => ({ ...current, search: "" }))
                  }
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <Button
              variant={filtersOpen ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="h-9 sm:h-11 text-xs"
            >
              <Filter size={14} /> Filters
            </Button>
          </div>
        </div>

        {filtersOpen && (
          <div className="hidden md:flex mt-3 flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5 sm:p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            {[
              ["type", "All types", CARD_TYPES],
              ["priority", "All priorities", PRIORITIES],
              [
                "label",
                "All labels",
                labels.map((item) => ({ value: item._id, label: item.name })),
              ],
              [
                "course",
                "All courses",
                courses.map((item) => ({ value: item._id, label: item.title })),
              ],
              [
                "status",
                "All statuses",
                columns.map((item) => ({ value: item._id, label: item.name })),
              ],
              [
                "due",
                "Any due date",
                [
                  { value: "overdue", label: "Overdue" },
                  { value: "week", label: "Next 7 days" },
                  { value: "none", label: "No due date" },
                ],
              ],
              [
                "sort",
                "Board order",
                [
                  { value: "priority", label: "Priority" },
                  { value: "due", label: "Due date" },
                  { value: "activity", label: "Recent activity" },
                ],
              ],
            ].map(([key, all, options]) => (
              <div key={key} className="w-full xs:w-auto flex-1 min-w-30">
                <Select
                  value={filters[key]}
                  onValueChange={(val) =>
                    setFilters((current) => ({
                      ...current,
                      [key]: val,
                    }))
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-2.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    <SelectValue placeholder={all} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={key === "sort" ? "position" : "all"}>
                      {all}
                    </SelectItem>
                    {options.map((option) => (
                      <SelectItem
                        key={option.value || option}
                        value={option.value || option}
                      >
                        {option.label || option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <button
              onClick={clearFilters}
              className="px-2 text-xs font-bold text-zinc-500 hover:text-red-600 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      {/* Small screens: simple Todo list; desktop Kanban remains unchanged. */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3 md:hidden">
        <div className="mb-2 flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-black">Tasks</h2>
            <p className="text-[10px] text-zinc-500">
              Check a task to move it to Done. Tap its title for details.
            </p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-zinc-500 shadow-xs dark:bg-zinc-900">
            {visibleCards.length}
          </span>
        </div>

        <div className="space-y-2">
          {visibleCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
              No tasks match the current filters.
            </div>
          ) : (
            visibleCards.map((card) => {
              const column = columns.find(
                (item) => item._id === getColumnId(card),
              );
              const completed = isDoneColumn(column);

              return (
                <div
                  key={card._id}
                  className={`flex items-start gap-3 rounded-2xl border bg-white p-3 shadow-xs dark:bg-zinc-900 ${
                    completed
                      ? "border-emerald-200 opacity-65 dark:border-emerald-900"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleTodoDone(card)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                    aria-label={completed ? "Mark task open" : "Mark task done"}
                  >
                    {completed && <span className="text-[10px] font-black">✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => openCardModal(card, "view")}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div
                      className={`text-sm font-bold leading-5 ${
                        completed ? "line-through text-zinc-400" : ""
                      }`}
                    >
                      {card.title}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                        {card.type || "Task"}
                      </span>

                      {column?.name && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-semibold text-zinc-500 dark:bg-zinc-800">
                          {column.name}
                        </span>
                      )}

                      {card.priority && card.priority !== "None" && (
                        <span className="text-[9px] font-semibold text-zinc-400">
                          {card.priority}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="hidden min-h-0 flex-1 md:flex">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => {
          if (String(active.id).startsWith("card:"))
            setActiveCard(
              cards.find((card) => `card:${card._id}` === active.id),
            );
        }}
        onDragCancel={() => setActiveCard(null)}
        onDragEnd={dragEnd}
      >
        {/* Mobile Column Select Tab Bar */}
        <div className="hidden border-b border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-950 overflow-x-auto gap-2 shrink-0 scrollbar-none">
          {columns.map((col) => {
            const colCardsCount = visibleCards.filter(
              (card) => getColumnId(card) === col._id,
            ).length;
            const isActive = activeColumnTab === col._id;
            return (
              <button
                key={col._id}
                onClick={() => scrollToColumn(col._id)}
                className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-black transition shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <span className="truncate max-w-30">{col.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                  }`}
                >
                  {colCardsCount}
                </span>
              </button>
            );
          })}
        </div>

        <main className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-2 sm:p-3 md:p-4 scrollbar-none">
          <SortableContext
            items={columns.map((column) => `column:${column._id}`)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex h-full w-full min-w-full md:w-auto md:min-w-max gap-3.5 sm:gap-4 snap-x snap-mandatory ">
              {columns.map((column) => (
                <PlannerColumn
                  key={column._id}
                  column={column}
                  cards={visibleCards.filter(
                    (card) => getColumnId(card) === column._id,
                  )}
                  onOpenCard={(card) => openCardModal(card, "view")}
                  onAddCard={createCard}
                  onRename={renameColumn}
                  onArchive={archiveColumn}
                  innerRef={(el) => (columnRefs.current[column._id] = el)}
                />
              ))}
            </div>
          </SortableContext>
        </main>
        <DragOverlay>
          {activeCard ? <PlannerCard card={activeCard} overlay /> : null}
        </DragOverlay>
      </DndContext>
      </div>
      {selectedCard && (
        <CardDetailDrawer
          key={selectedCard._id || "new-task"}
          card={selectedCard}
          initialMode={cardModalMode}
          columns={columns}
          labels={labels}
          courses={courses}
          cards={cards}
          onClose={closeCardModal}
          onSave={saveCard}
          onDuplicate={duplicateCard}
          onArchive={archiveCard}
          onDelete={deleteCard}
          onCreateLabel={createLabel}
          onModeChange={changeCardModalMode}
        />
      )}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        loading={confirmLoading}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
      />
    </div>
  );
}
