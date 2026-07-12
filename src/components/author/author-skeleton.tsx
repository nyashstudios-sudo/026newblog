export default function AuthorSkeleton() {
  const shimmer = 'linear-gradient(90deg, var(--bg-inset) 25%, var(--bg-elevated) 50%, var(--bg-inset) 75%)';
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        overflow: 'hidden',
        padding: 28,
      }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: shimmer,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 20,
              width: '60%',
              background: shimmer,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <div
            style={{
              height: 14,
              width: '40%',
              background: shimmer,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: 4,
            }}
          />
        </div>
      </div>
      <div
        style={{
          height: 14,
          width: '100%',
          background: shimmer,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4,
          marginBottom: 8,
        }}
      />
      <div
        style={{
          height: 14,
          width: '80%',
          background: shimmer,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4,
          marginBottom: 8,
        }}
      />
      <div
        style={{
          height: 14,
          width: '60%',
          background: shimmer,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          borderRadius: 4,
        }}
      />
    </div>
  );
}
