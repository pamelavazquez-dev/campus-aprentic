import React from 'react'
import Layout from '../components/Layout.jsx'
import CourseCard from '../components/CourseCard.jsx'

export default function Home() {
  return (
    <Layout>
      <main>
        {/* TODO: Add home page content, hero section, and featured cards. */}
        <section>
          {/* TODO: Add a course card grid section to show courses as cards. */}
          <CourseCard />
          <CourseCard />
          <CourseCard />
        </section>
      </main>
    </Layout>
  )
}
