"use client";

import type { ShopItem, ShopCategory, Faction } from "@/types";

import { useState, useEffect, useRef } from "react";
import { Input, Textarea } from "@heroui/input";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Spinner } from "@heroui/spinner";
import { useTranslations } from "next-intl";

import { SHOP_CATEGORIES, SERVICE_TYPES } from "@/lib/shop-utils";
import { GameTipLink } from "@/components/game-tooltip";
import { DEFAULT_REALM, REALMS, REALM_SLUGS } from "@/lib/realms";

interface ItemFormProps {
  item?: ShopItem;
  onSubmit: (data: Partial<ShopItem>) => Promise<void>;
  loading?: boolean;
}

export function ItemForm({ item, onSubmit, loading }: ItemFormProps) {
  const t = useTranslations("admin.items");
  const tc = useTranslations("admin.common");
  const tRealms = useTranslations("realms");
  const tCat = useTranslations("shop.categories");
  const tSvc = useTranslations("shop.serviceTypes");
  const tQuality = useTranslations("shop.qualities");
  const isEdit = !!item;

  const savedCategory =
    !isEdit && typeof window !== "undefined"
      ? (localStorage.getItem(
          "lordaeron_admin_last_category",
        ) as ShopCategory | null)
      : null;

  const [form, setForm] = useState({
    category: item?.category || savedCategory || "services",
    service_type: item?.service_type || "",
    item_id: item?.item_id?.toString() || "",
    name_en: item?.name_en || "",
    name_fr: item?.name_fr || "",
    name_es: item?.name_es || "",
    name_de: item?.name_de || "",
    name_it: item?.name_it || "",
    description_en: item?.description_en || "",
    description_fr: item?.description_fr || "",
    description_es: item?.description_es || "",
    description_de: item?.description_de || "",
    description_it: item?.description_it || "",
    price: item?.price?.toString() || "",
    discount_percentage: item?.discount_percentage?.toString() || "0",
    faction: item?.faction || "both",
    // the realms that sell it; an item from before the realms (none) is Lordaeron's (lib/realms.ts offeredOnRealm)
    realm_ids: (item?.realm_ids?.length
      ? item.realm_ids
      : [REALMS[DEFAULT_REALM].realmId]
    ).map(String),
    icon_url: item?.icon_url || "",
    quality: item?.quality?.toString() ?? "4",
    sort_order: item?.sort_order?.toString() || "0",
    min_level: item?.min_level?.toString() || "0",
    is_highlighted: item?.is_highlighted || false,
    is_active: item?.is_active !== false,
    is_refundable: item?.is_refundable !== false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      category: form.category as ShopItem["category"],
      service_type: form.service_type || null,
      item_id: form.item_id ? parseInt(form.item_id) : null,
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
      faction: form.faction as ShopItem["faction"],
      realm_ids: form.realm_ids.map(Number),
      icon_url: form.icon_url || null,
      quality: form.quality !== "" ? parseInt(form.quality) : null,
      sort_order: parseInt(form.sort_order) || 0,
      min_level: parseInt(form.min_level) || 0,
      is_highlighted: form.is_highlighted,
      is_active: form.is_active,
      is_refundable: form.is_refundable,
    } as Partial<ShopItem>);
  };

  const [fetchingIcon, setFetchingIcon] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [itemFound, setItemFound] = useState(!!item?.item_id);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialItemId = useRef(item?.item_id?.toString() || "");

  useEffect(() => {
    // Skip auto-fetch on initial mount for edit mode (icon already set)
    if (form.item_id === initialItemId.current) return;

    const id = parseInt(form.item_id);

    if (!id || id <= 0) {
      setFetchError("");
      setItemFound(false);

      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setFetchingIcon(true);
      setFetchError("");
      setItemFound(false);
      try {
        const res = await fetch(`/api/admin/wowhead-icon?item_id=${id}`);
        const data = await res.json();

        if (data.found && data.iconUrl) {
          setItemFound(true);
          setForm((prev) => ({
            ...prev,
            icon_url: data.iconUrl,
            name_en: data.names?.en || prev.name_en,
            name_fr: data.names?.fr || prev.name_fr,
            name_es: data.names?.es || prev.name_es,
            name_de: data.names?.de || prev.name_de,
            name_it: data.names?.it || prev.name_it,
          }));
        } else {
          setFetchError(data.error || "Item not found");
        }
      } catch {
        setFetchError("Network error");
      } finally {
        setFetchingIcon(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.item_id]);

  const inputClass = "bg-[#0d1117] border-gray-700";

  return (
    <form className="space-y-6 max-w-3xl" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          classNames={{ trigger: inputClass }}
          label={t("category")}
          selectedKeys={[form.category]}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;

            if (key) {
              setForm({ ...form, category: key as ShopCategory });
              localStorage.setItem("lordaeron_admin_last_category", key);
            }
          }}
        >
          {SHOP_CATEGORIES.map((cat) => (
            <SelectItem key={cat}>{tCat(cat)}</SelectItem>
          ))}
        </Select>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Autocomplete
          allowsCustomValue
          classNames={{
            base: "max-w-full",
          }}
          defaultInputValue={form.service_type}
          inputProps={{
            classNames: { inputWrapper: inputClass },
          }}
          isDisabled={form.category !== "services"}
          isRequired={form.category === "services"}
          label={tc("serviceType")}
          popoverProps={{
            classNames: { content: "bg-[#161b22] border border-gray-700" },
          }}
          onInputChange={(v) => setForm({ ...form, service_type: v })}
          onSelectionChange={(key) => {
            if (key) setForm({ ...form, service_type: String(key) });
          }}
        >
          {SERVICE_TYPES.map((st) => (
            <AutocompleteItem key={st.value} textValue={st.value}>
              <div>
                <span className="text-gray-200">{tSvc(st.value)}</span>
                <span className="text-xs text-gray-500 ml-2">({st.value})</span>
              </div>
            </AutocompleteItem>
          ))}
        </Autocomplete>
        <div className="flex items-end gap-3">
          <Input
            className="flex-1"
            classNames={{ inputWrapper: inputClass }}
            isDisabled={form.category === "services"}
            isRequired={form.category !== "services"}
            label={tc("wowItemId")}
            min={0}
            type="number"
            value={form.item_id}
            onValueChange={(v) => setForm({ ...form, item_id: v })}
          />
          {fetchingIcon && (
            <div className="shrink-0 mb-2">
              <Spinner color="warning" size="sm" />
            </div>
          )}
          {!fetchingIcon &&
            itemFound &&
            form.icon_url &&
            form.item_id &&
            parseInt(form.item_id) > 0 && (
              <GameTipLink
                className="shrink-0 mb-1"
                itemId={parseInt(form.item_id)}
              >
                <div className="w-12 h-12 rounded-lg bg-[#0d1117] border border-gray-700 hover:border-wow-gold/40 flex items-center justify-center overflow-hidden transition-colors">
                  <img
                    alt=""
                    className="w-10 h-10 object-contain"
                    src={form.icon_url}
                  />
                </div>
              </GameTipLink>
            )}
        </div>
        {fetchError && (
          <p className="text-xs text-red-400 -mt-3">{fetchError}</p>
        )}
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
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<span class="text-xs text-red-400">404</span>';
              }}
            />
          </div>
        )}
      </div>

      <Select
        isRequired
        className="max-w-xs"
        classNames={{ trigger: inputClass }}
        label={tc("quality")}
        selectedKeys={form.quality !== "" ? [form.quality] : []}
        onSelectionChange={(keys) => {
          const key = Array.from(keys)[0] as string | undefined;

          setForm({ ...form, quality: key ?? "" });
        }}
      >
        <SelectItem key="0">{tQuality("0")}</SelectItem>
        <SelectItem key="1">{tQuality("1")}</SelectItem>
        <SelectItem key="2">{tQuality("2")}</SelectItem>
        <SelectItem key="3">{tQuality("3")}</SelectItem>
        <SelectItem key="4">{tQuality("4")}</SelectItem>
        <SelectItem key="5">{tQuality("5")}</SelectItem>
        <SelectItem key="6">{tQuality("6")}</SelectItem>
        <SelectItem key="7">{tQuality("7")}</SelectItem>
      </Select>

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
        <Switch
          isSelected={form.is_refundable}
          onValueChange={(v) => setForm({ ...form, is_refundable: v })}
        >
          <span className="text-gray-300 text-sm">{t("refundable")}</span>
        </Switch>
      </div>

      <Button
        className="bg-gradient-to-r from-wow-gold to-wow-gold-light text-black font-bold"
        isLoading={loading}
        type="submit"
      >
        {isEdit ? t("save") : t("addItem")}
      </Button>
    </form>
  );
}
