import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment'; // Asegúrate que el alias @env funcione, si no usa la ruta relativa
import { Observable, map } from 'rxjs';

// Importamos la interfaz común del otro servicio para no duplicar tipos
import { AdviserCardResponse } from './adviser.service';

interface FavoriteTeacherResponse {
  userId: number;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  level: string | null;
  description: string | null;
  specialties: string[];
  stateCode?: string | null; // El backend podría no mandarlo
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  // Inyección moderna (opcional, pero consistente con tus otros componentes)
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * GET /api/v1/favorites/teachers
   */
  getMyFavoriteTeachers(): Observable<AdviserCardResponse[]> {
    const url = `${this.apiUrl}/favorites/teachers`;

    return this.http.get<FavoriteTeacherResponse[]>(url).pipe(
      map(response =>
        response.map(dto => ({
          userId: dto.userId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          photoUrl: dto.photoUrl,
          level: dto.level,
          description: dto.description,
          specialties: dto.specialties ?? [],
          stateCode: dto.stateCode || null // Protección contra undefined
        }))
      )
    );
  }

  /**
   * POST /api/v1/favorites/teachers/{teacherId}
   */
  addFavorite(teacherId: number): Observable<void> {
    const url = `${this.apiUrl}/favorites/teachers/${teacherId}`;
    return this.http.post<void>(url, {});
  }

  /**
   * DELETE /api/v1/favorites/teachers/{teacherId}
   */
  removeFavorite(teacherId: number): Observable<void> {
    const url = `${this.apiUrl}/favorites/teachers/${teacherId}`;
    return this.http.delete<void>(url);
  }
}
