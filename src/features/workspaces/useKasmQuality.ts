import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { QUALITY_CONTROLS, type QualityControlName, type QualityValues } from './kasm-quality';

type QualityElement = HTMLInputElement | HTMLSelectElement;

export function useKasmQuality(iframeRef: RefObject<HTMLIFrameElement | null>) {
  const [values, setValues] = useState<QualityValues>({});
  const [available, setAvailable] = useState(false);
  const initializedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readValues = useCallback(() => {
    try {
      const document = iframeRef.current?.contentDocument;
      if (!document) {
        setAvailable(false);
        return false;
      }

      const nextValues: QualityValues = {};
      for (const control of QUALITY_CONTROLS) {
        const element = document.getElementById(
          `noVNC_setting_${control.name}`
        ) as QualityElement | null;
        if (!element) {
          setAvailable(false);
          return false;
        }
        nextValues[control.name] = element.value;
      }
      setValues(nextValues);
      setAvailable(true);
      return true;
    } catch {
      setAvailable(false);
      return false;
    }
  }, [iframeRef]);

  const applyValue = useCallback(
    (name: QualityControlName, value: string) => {
      try {
        const iframe = iframeRef.current;
        const element = iframe?.contentDocument?.getElementById(
          `noVNC_setting_${name}`
        ) as QualityElement | null;
        if (!iframe?.contentWindow || !element) {
          setAvailable(false);
          return;
        }
        element.value = value;
        const iframeWindow = iframe.contentWindow as Window & typeof globalThis;
        element.dispatchEvent(new iframeWindow.Event('change', { bubbles: true }));
        return true;
      } catch {
        setAvailable(false);
        return false;
      }
    },
    [iframeRef]
  );

  const updateValue = useCallback((name: QualityControlName, value: string) => {
    setValues((current) => ({
      ...current,
      ...(name === 'video_quality' ? {} : { video_quality: '10' }),
      [name]: value,
    }));
  }, []);

  const saveValues = useCallback(() => {
    try {
      if (!iframeRef.current?.contentDocument || !values.video_quality) {
        setAvailable(false);
        return false;
      }

      const videoQuality = values.video_quality;
      if (!applyValue('video_quality', videoQuality)) return false;
      if (videoQuality === '10') {
        for (const control of QUALITY_CONTROLS) {
          if (control.name === 'video_quality') continue;
          const value = values[control.name];
          if (value === undefined || !applyValue(control.name, value)) return false;
        }
      }
      return readValues();
    } catch {
      setAvailable(false);
      return false;
    }
  }, [applyValue, readValues, values]);

  const forceImageMode = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) {
        setAvailable(false);
        return;
      }
      iframe.contentWindow.postMessage(
        { action: 'set_streaming_mode', value: 'image' },
        window.location.origin
      );
    } catch {
      setAvailable(false);
    }
  }, [iframeRef]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.source !== iframeRef.current?.contentWindow ||
        event.origin !== window.location.origin ||
        event.data?.action !== 'noVNC_initialized'
      ) {
        return;
      }
      if (initializedTimerRef.current) {
        clearTimeout(initializedTimerRef.current);
      }
      initializedTimerRef.current = setTimeout(() => {
        initializedTimerRef.current = null;
        readValues();
      }, 300);
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (initializedTimerRef.current) {
        clearTimeout(initializedTimerRef.current);
      }
    };
  }, [iframeRef, readValues]);

  return {
    values,
    available,
    readValues,
    updateValue,
    saveValues,
    forceImageMode,
  };
}
