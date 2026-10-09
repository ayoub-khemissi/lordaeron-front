"use client";

import type { ShopSetWithItems, ShopSetItem, Faction } from "@/types";

import { useState, useEffect, useRef } from "react";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Spinner } from "@heroui/spinner";
import { useTranslations } from "next-intl";

import { GameTipLink } from "@/components/game-tooltip";
import { DEFAULT_REALM, REALMS, REALM_SLUGS } from "@/lib/realms";

interface SetFormProps {
  set?: ShopSetWithItems;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
}

interface PieceForm {
  key: string;
  item_id: string;
  name_en: string;
  name_fr: string;
  name_es: string;
  name_de: string;
  name_it: string;
  icon_url: string;
  quality: string;
  sort_order: string;
  fetching: boolean;
  found: boolean;
}

function createEmptyPiece(): PieceForm {
  return {
    key: crypto.randomUUID(),
    item_id: "",
    name_en: "",
    name_fr: "",
    name_es: "",
    name_de: "",
    name_it: "",
    icon_url: "",
    quality: "",
    sort_order: "0",
    fetching: false,
    found: false,
  };
}

function itemToPieceForm(item: ShopSetItem): PieceForm {
  return {
    key: crypto.randomUUID(),
    item_id: item.item_id.toString(),
    name_en: item.name_en,
    name_fr: item.name_fr,
    name_es: item.name_es,
    name_de: item.name_de,
    name_it: item.name_it,
    icon_url: item.icon_url || "",
    quality: item.quality?.toString() ?? "",
    sort_order: item.sort_order.toString(),
    fetching: false,
    found: !!item.item_id,
  };
}

export function SetForm({ set, onSubmit, loading }: SetFormProps) {
  const t = useTranslations("admin.sets");
  const tc = useTranslations("admin.common");
  const tRealms = useTranslations("realms");
  const isEdit = !!set;

  const [form, setForm] = useState({
    name_en: set?.name_en || "",
    name_fr: set?.name_fr || "",
    name_es: set?.name_es || "",
    name_de: set?.name_de || "",
    name_it: set?.name_it || "",
    description_en: set?.description_en || "",
    description_fr: set?.description_fr || "",
    description_es: set?.description_es || "",
    description_de: set?.description_de || "",
    description_it: set?.description_it || "",
    price: set?.price?.toString() || "",
    discount_percentage: set?.discount_percentage?.toString() || "0",
    faction: set?.faction || "both",
    realm_ids: (set?.realm_ids?.length
      ? set.realm_ids
      : [REALMS[DEFAULT_REALM].realmId]
    ).map(String),
    icon_url: set?.icon_url || "",
    sort_order: set?.sort_order?.toString() || "0",
    min_level: set?.min_level?.toString() || "0",
    is_highlighted: set?.is_highlighted || false,
    is_active: set?.is_active !== false,
  });

  const [pieces, setPieces] = useState<PieceForm[]>(
    set?.items.map(itemToPieceForm) || [createEmptyPiece()],
  );

  const addPiece = () => {
    setPieces((prev) => [...prev, createEmptyPiece()]);
  };

  const removePiece = (key: string) => {
    setPieces((prev) => prev.filter((p) => p.key !== key));
  };

  const updatePiece = (
    key: string,
    field: keyof PieceForm,
    value: string | boolean,
  ) => {
    setPieces((prev) =>
      prev.map((p) => (p.key === key ? { ...p, [field]: value } : p)),
    );
  };

  // Auto-fetch item data when WoW Item ID changes
  const debounceRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  const fetchItemData = (key: string, itemIdStr: string) => {
    if (debounceRefs.current[key]) clearTimeout(debounceRefs.current[key]);

    const id = parseInt(itemIdStr);

    if (!id || id <= 0) return;

    updatePiece(key, "fetching", true as unknown as string);

    debounceRefs.current[key] = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/wowhead-icon?item_id=${id}`);
        const data = await res.json();

        if (data.found && data.iconUrl) {
          setPieces((prev) =>
            prev.map((p) =>
              p.key === key
                ? {
                    ...p,
                    icon_url: data.iconUrl,
                    name_en: data.names?.en || p.name_en,
                    name_fr: data.names?.fr || p.name_fr,
                    name_es: data.names?.es || p.name_es,
                    name_de: data.names?.de || p.name_de,
                    name_it: data.names?.it || p.name_it,
                    quality: data.quality?.toString() ?? p.quality,
                    fetching: false,
                    found: true,
                  }
                : p,
            ),
          );
        } else {
          setPieces((prev) =>
            prev.map((p) =>
              p.key === key ? { ...p, fetching: false, found: false } : p,
            ),
          );
        }
      } catch {
        setPieces((prev) =>
          prev.map((p) => (p.key === key ? { ...p, fetching: false } : p)),
        );
      }
    }, 600);
  };

  // Set icon_url from first piece if not set manually
  useEffect(() => {
    if (!form.icon_url && pieces.length > 0 && pieces[0].icon_url) {
      setForm((prev) => ({ ...prev, icon_url: pieces[0].icon_url }));
    }
  }, [pieces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validPieces = pieces.filter((p) => parseInt(p.item_id) > 0);

    if (validPieces.length === 0) return;

    await onSubmit({
      name_en: form.name_en,
      name_fr: form.name_fr,
      name_es: form.name_es,
      name_de: form.name_de,
      name_it: form.name_it,
      description_en: form.description_en || null,
      description_fr: form.description_fr || null,
      description_es: form.description_es || null,
      description_de: form.description_de || null,
      description_it: form.description_it || null,
      price: parseInt(form.price) || 0,
      discount_percentage: parseInt(form.discount_percentage) || 0,
      faction: form.faction,
      realm_ids: form.realm_ids.map(Number),
      icon_url: form.icon_url || null,
      sort_order: parseInt(form.sort_order) || 0,
      min_level: parseInt(form.min_level) || 0,
      is_highlighted: form.is_highlighted,
      is_active: form.is_active,
      items: validPieces.map((p, idx) => ({
        item_id: parseInt(p.item_id),
        name_en: p.name_en,
        name_fr: p.name_fr,
        name_es: p.name_es,
        name_de: p.name_de,
        name_it: p.name_it,
        icon_url: p.icon_url || null,
        quality: p.quality !== "" ? parseInt(p.quality) : null,
        sort_order: parseInt(p.sort_order) || idx,
      })),
    });
  };

  const inputClass = "bg-[#0d1117] border-gray-700";

  return (
    <form className="space-y-6 max-w-4xl" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          classNames={{ trigger: inputClass }}
          label={tc("faction")}
          selectedKeys={[form.faction]}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;

            if (key) setForm({ ...form, faction: key as Faction });
          }}
        >
          <SelectItem key="both">{tc("both")}</SelectItem>
          <SelectItem key="alliance">{tc("alliance")}</SelectItem>
          <SelectItem key="horde">{tc("horde")}</SelectItem>
        </Select>

        <Select
          classNames={{ trigger: inputClass }}
          label={tRealms("label")}
          selectedKeys={form.realm_ids}
          selectionMode="multiple"
          onSelectionChange={(keys) => {
            const ids = Array.from(keys).map(String);

            if (ids.length) setForm({ ...form, realm_ids: ids });
          }}
        >
          {REALM_SLUGS.map((slug) => (
            <SelectItem key={String(REALMS[slug].realmId)}>
              {REALMS[slug].name}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Localized names */}
      <div className="border border-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-400 mb-3">
          {t("name")} ({tc("localized")})
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            isRequired
            classNames={{ inputWrapper: inputClass }}
            label="EN"
            value={form.name_en}
            onValueChange={(v) => setForm({ ...form, name_en: v })}
          />
          <Input
            isRequired
            classNames={{ inputWrapper: inputClass }}
            label="FR"
            value={form.name_fr}
            onValueChange={(v) => setForm({ ...form, name_fr: v })}
          />
          <Input
            isRequired
            classNames={{ inputWrapper: inputClass }}
            label="ES"
            value={form.name_es}
            onValueChange={(v) => setForm({ ...form, name_es: v })}
          />
          <Input
            isRequired
            classNames={{ inputWrapper: inputClass }}
            label="DE"
            value={form.name_de}
            onValueChange={(v) => setForm({ ...form, name_de: v })}
          />
          <Input
            isRequired
            classNames={{ inputWrapper: inputClass }}
            label="IT"
            value={form.name_it}
            onValueChange={(v) => setForm({ ...form, name_it: v })}
          />
        </div>
      </div>

      {/* Localized descriptions */}
      <div className="border border-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-400 mb-3">
          {tc("description")} ({tc("localized")})
        </p>
        <div className="grid grid-cols-1 gap-3">
          <Textarea
            classNames={{ inputWrapper: inputClass }}
            label="EN"
            minRows={2}
            value={form.description_en}
            onValueChange={(v) => setForm({ ...form, description_en: v })}
          />
          <Textarea
            classNames={{ inputWrapper: inputClass }}
            label="FR"
            minRows={2}
            value={form.description_fr}
            onValueChange={(v) => setForm({ ...form, description_fr: v })}
          />
          <Textarea
            classNames={{ inputWrapper: inputClass }}
            label="ES"
            minRows={2}
            value={form.description_es}
            onValueChange={(v) => setForm({ ...form, description_es: v })}
          />
          <Textarea
            classNames={{ inputWrapper: inputClass }}
            label="DE"
            minRows={2}
            value={form.description_de}
            onValueChange={(v) => setForm({ ...form, description_de: v })}
          />
          <Textarea
            classNames={{ inputWrapper: inputClass }}
            label="IT"
            minRows={2}
            value={form.description_it}
            onValueChange={(v) => setForm({ ...form, description_it: v })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          isRequired
          classNames={{ inputWrapper: inputClass }}
          label={t("price")}
          type="number"
          value={form.price}
          onValueChange={(v) => setForm({ ...form, price: v })}
        />
        <Input
          isRequired
          classNames={{ inputWrapper: inputClass }}
          label={`${t("discount")} (%)`}
          type="number"
          value={form.discount_percentage}
          onValueChange={(v) => setForm({ ...form, discount_percentage: v })}
        />
        <Input
          isRequired
          classNames={{ inputWrapper: inputClass }}
          label={tc("sortOrder")}
          type="number"
          value={form.sort_order}
          onValueChange={(v) => setForm({ ...form, sort_order: v })}
        />
        <Input
          isRequired
          classNames={{ inputWrapper: inputClass }}
          description={tc("minLevelDesc")}
          label={tc("minLevel")}
          max={80}
          min={0}
          type="number"
          value={form.min_level}
          onValueChange={(v) => setForm({ ...form, min_level: v })}
        />
      </div>

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <Input
            isRequired
            classNames={{ inputWrapper: inputClass }}
            label={tc("iconUrl")}
            placeholder="https://wow.zamimg.com/images/wow/icons/large/..."
            value={form.icon_url}
            onValueChange={(v) => setForm({ ...form, icon_url: v })}
          />
        </div>
        {form.icon_url && (
          <div className="w-16 h-16 rounded-lg bg-[#0d1117] border border-gray-700 flex items-center justify-center overflow-hidden shrink-0 mt-1">
            <img
              alt="Icon preview"
              className="w-12 h-12 object-contain"
              src={form.icon_url}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-6">
        <Switch
          isSelected={form.is_active}
          onValueChange={(v) => setForm({ ...form, is_active: v })}
        >
          <span className="text-gray-300 text-sm">{t("active")}</span>
        </Switch>
        <Switch
          isSelected={form.is_highlighted}
          onValueChange={(v) => setForm({ ...form, is_highlighted: v })}
        >
          <span className="text-gray-300 text-sm">{t("highlighted")}</span>
        </Switch>
      </div>

      {/* Set Items Section */}
      <div className="border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400 font-medium">
            {t("pieces")} ({pieces.length})
          </p>
          <Button
            className="bg-wow-gold/10 text-wow-gold"
            size="sm"
            variant="flat"
            onPress={addPiece}
          >
            {t("addPiece")}
          </Button>
        </div>

        <div className="space-y-4">
          {pieces.map((piece, idx) => (
            <div
              key={piece.key}
              className="bg-[#0d1117] rounded-lg p-4 border border-gray-800"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">#{idx + 1}</span>
                {pieces.length > 1 && (
                  <Button
                    className="text-red-400 min-w-0 px-2"
                    size="sm"
                    variant="light"
                    onPress={() => removePiece(piece.key)}
                  >
                    {t("removePiece")}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-end gap-2">
                  <Input
                    isRequired
                    className="flex-1"
                    classNames={{ inputWrapper: inputClass }}
                    label={tc("wowItemId")}
                    min={0}
                    type="number"
                    value={piece.item_id}
                    onValueChange={(v) => {
                      updatePiece(piece.key, "item_id", v);
                      fetchItemData(piece.key, v);
                    }}
                  />
                  {piece.fetching && (
                    <Spinner className="mb-2" color="warning" size="sm" />
                  )}
                  {!piece.fetching &&
                    piece.found &&
                    piece.icon_url &&
                    parseInt(piece.item_id) > 0 && (
                      <GameTipLink
                        className="shrink-0 mb-1"
                        itemId={parseInt(piece.item_id)}
                      >
                        <div className="w-10 h-10 rounded bg-[#161b22] border border-gray-700 hover:border-wow-gold/40 flex items-center justify-center overflow-hidden transition-colors">
                          <img
                            alt=""
                            className="w-8 h-8 object-contain"
                            src={piece.icon_url}
                          />
                        </div>
                      </GameTipLink>
                    )}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">
                  {t("name")} ({tc("localized")})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <Input
                    isRequired
                    classNames={{ inputWrapper: inputClass }}
                    label="EN"
                    size="sm"
                    value={piece.name_en}
                    onValueChange={(v) => updatePiece(piece.key, "name_en", v)}
                  />
                  <Input
                    isRequired
                    classNames={{ inputWrapper: inputClass }}
                    label="FR"
                    size="sm"
                    value={piece.name_fr}
                    onValueChange={(v) => updatePiece(piece.key, "name_fr", v)}
                  />
                  <Input
                    isRequired
                    classNames={{ inputWrapper: inputClass }}
                    label="ES"
                    size="sm"
                    value={piece.name_es}
                    onValueChange={(v) => updatePiece(piece.key, "name_es", v)}
                  />
                  <Input
                    isRequired
                    classNames={{ inputWrapper: inputClass }}
                    label="DE"
                    size="sm"
                    value={piece.name_de}
                    onValueChange={(v) => updatePiece(piece.key, "name_de", v)}
                  />
                  <Input
                    isRequired
                    classNames={{ inputWrapper: inputClass }}
                    label="IT"
                    size="sm"
                    value={piece.name_it}
                    onValueChange={(v) => updatePiece(piece.key, "name_it", v)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold"
        isLoading={loading}
        type="submit"
      >
        {isEdit ? t("save") : t("addSet")}
      </Button>
    </form>
  );
}
